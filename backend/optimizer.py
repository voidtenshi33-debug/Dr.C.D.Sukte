import math
from typing import Dict, List, Any, Optional

# Severity weights used for prioritization
SEVERITY_WEIGHTS = {
    "Critical": 4.0,
    "High": 2.5,
    "Medium": 1.5,
    "Low": 1.0
}

# Staging Center / Headquarters default coordinates (Mumbai / Central Command)
DEFAULT_HQ = {"latitude": 19.0760, "longitude": 72.8777}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in km."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def optimize_resource_allocation(
    incidents: List[Dict[str, Any]],
    inventory: Dict[str, int],
    hq_coords: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Multi-criteria Priority-Weighted Resource Allocation Optimizer:
    1. Prioritizes critical and high-severity incidents.
    2. Strictly respects inventory bounds (no negative inventory, no allocation over stock).
    3. Minimizes unmet demand by tier-based allocation and proportional fair sharing.
    4. Computes dispatch distances from HQ/staging base.
    5. Generates detailed decision rationales for each incident allocation.
    """
    if hq_coords is None:
        hq_coords = DEFAULT_HQ

    hq_lat = hq_coords.get("latitude", DEFAULT_HQ["latitude"])
    hq_lon = hq_coords.get("longitude", DEFAULT_HQ["longitude"])

    # 1. Filter active incidents that need resources
    active_incidents = [
        inc for inc in incidents
        if inc.get("status", "Active") not in ["Resolved", "Closed"]
    ]

    if not active_incidents:
        return {
            "incident_allocations": [],
            "summary": {
                "total_requested": 0,
                "total_allocated": 0,
                "overall_fulfillment_pct": 100.0,
                "critical_fulfillment_pct": 100.0,
                "remaining_inventory": dict(inventory),
                "unmet_shortages": {}
            },
            "status": "success",
            "message": "No active incidents requiring allocation."
        }

    # 2. Score and sort incidents by priority
    scored_incidents = []
    for inc in active_incidents:
        sev = inc.get("severity", "Medium")
        w_sev = SEVERITY_WEIGHTS.get(sev, 1.5)
        pop = inc.get("affected_population", 1000)
        pop_factor = 1.0 + (math.log10(max(10, pop)) / 6.0)  # scale 1.0 - 2.0

        lat = inc.get("latitude", hq_lat)
        lon = inc.get("longitude", hq_lon)
        dist_km = haversine_distance_km(hq_lat, hq_lon, lat, lon)

        # Distance penalty is slight so severity always dominates, but closer incidents get priority if tie
        dist_penalty = max(0.85, 1.0 - (dist_km / 1000.0) * 0.15)
        urgency_score = round(w_sev * pop_factor * dist_penalty, 3)

        scored_incidents.append({
            "incident": inc,
            "severity": sev,
            "weight": w_sev,
            "dist_km": round(dist_km, 1),
            "priority_score": urgency_score
        })

    # Sort descending by priority_score
    scored_incidents.sort(key=lambda x: x["priority_score"], reverse=True)

    # 3. Track available inventory remaining
    remaining_inv = {k: int(v) for k, v in inventory.items()}
    resource_keys = list(inventory.keys())

    # Map allocations per incident: { incident_id: { resource_key: count } }
    allocations_by_inc = {s["incident"]["id"]: {k: 0 for k in resource_keys} for s in scored_incidents}

    # 4. Multi-tier Constrained Knapsack / Fair Distribution:
    # Tier 1: Critical (try 100% demand)
    # Tier 2: High (try 85-100% demand)
    # Tier 3: Medium
    # Tier 4: Low
    for tier_sev in ["Critical", "High", "Medium", "Low"]:
        tier_items = [s for s in scored_incidents if s["severity"] == tier_sev]
        if not tier_items:
            continue

        for r_key in resource_keys:
            available_for_resource = remaining_inv.get(r_key, 0)
            if available_for_resource <= 0:
                continue

            tier_demanded = sum(
                s["incident"].get("demands", {}).get(r_key, 0) - allocations_by_inc[s["incident"]["id"]][r_key]
                for s in tier_items
            )

            if tier_demanded <= 0:
                continue

            if available_for_resource >= tier_demanded:
                # Can fulfill entire tier demand
                for s in tier_items:
                    inc_id = s["incident"]["id"]
                    req = s["incident"].get("demands", {}).get(r_key, 0) - allocations_by_inc[inc_id][r_key]
                    allocations_by_inc[inc_id][r_key] += req
                    remaining_inv[r_key] -= req
            else:
                # Capacity is less than tier demand -> allocate proportionally based on priority and demand
                # Sort tier_items by priority score
                for s in tier_items:
                    if remaining_inv[r_key] <= 0:
                        break
                    inc_id = s["incident"]["id"]
                    req = s["incident"].get("demands", {}).get(r_key, 0) - allocations_by_inc[inc_id][r_key]
                    if req <= 0:
                        continue

                    # Proportion of remaining
                    share = int(math.ceil(req * (available_for_resource / max(1, tier_demanded))))
                    alloc_amt = min(req, share, remaining_inv[r_key])
                    allocations_by_inc[inc_id][r_key] += alloc_amt
                    remaining_inv[r_key] -= alloc_amt

    # 5. Build detailed result records and decision rationales
    incident_allocations = []
    total_requested_sum = 0
    total_allocated_sum = 0
    shortages_by_res = {k: 0 for k in resource_keys}

    critical_req_sum = 0
    critical_alloc_sum = 0

    for s in scored_incidents:
        inc = s["incident"]
        inc_id = inc["id"]
        demands = inc.get("demands", {})
        allocs = allocations_by_inc[inc_id]

        inc_req_total = sum(demands.get(k, 0) for k in resource_keys)
        inc_alloc_total = sum(allocs.get(k, 0) for k in resource_keys)

        total_requested_sum += inc_req_total
        total_allocated_sum += inc_alloc_total

        if s["severity"] == "Critical":
            critical_req_sum += inc_req_total
            critical_alloc_sum += inc_alloc_total

        fulfillment_pct = round((inc_alloc_total / inc_req_total * 100) if inc_req_total > 0 else 100.0, 1)

        # Calculate shortages
        shortages = {}
        has_shortage = False
        for k in resource_keys:
            req = demands.get(k, 0)
            given = allocs.get(k, 0)
            diff = req - given
            if diff > 0:
                shortages[k] = diff
                shortages_by_res[k] += diff
                has_shortage = True
            else:
                shortages[k] = 0

        # Generate intelligent decision rationale
        rationale_parts = []
        if s["severity"] == "Critical":
            rationale_parts.append(
                f"Critical priority status: Allocated highest precedence (priority index: {s['priority_score']})."
            )
        elif s["severity"] == "High":
            rationale_parts.append(
                f"High severity tier: Prioritized immediately after critical life-safety incidents."
            )
        elif s["severity"] == "Medium":
            rationale_parts.append(
                f"Medium urgency: Balanced allocation based on remaining regional depot buffer."
            )
        else:
            rationale_parts.append(
                f"Low severity incident: Non-emergency standard quota assigned."
            )

        if fulfillment_pct == 100.0:
            rationale_parts.append(f"100% of requested demand successfully fulfilled.")
        elif fulfillment_pct >= 75.0:
            deficit_items = [f"{shortages[k]} {k.replace('_', ' ')}" for k in shortages if shortages[k] > 0]
            rationale_parts.append(
                f"High fulfillment ({fulfillment_pct}%). Minor deficit in: {', '.join(deficit_items)} due to depot limits."
            )
        else:
            deficit_items = [f"{shortages[k]} {k.replace('_', ' ')}" for k in shortages if shortages[k] > 0]
            rationale_parts.append(
                f"Partial fulfillment ({fulfillment_pct}%). Deficit in {', '.join(deficit_items)}; mutual aid or secondary supply recommended."
            )

        rationale_parts.append(f"Transit distance from Central Command: {s['dist_km']} km.")
        explanation = " ".join(rationale_parts)

        incident_allocations.append({
            "incident_id": inc_id,
            "title": inc.get("title", f"Incident #{inc_id}"),
            "disaster_type": inc.get("disaster_type", "Unknown"),
            "severity": s["severity"],
            "location_name": inc.get("location_name", "Unknown Area"),
            "distance_km": s["dist_km"],
            "priority_score": s["priority_score"],
            "demanded": demands,
            "allocated": allocs,
            "shortage": shortages,
            "fulfillment_pct": fulfillment_pct,
            "status": "Fully Fulfilled" if fulfillment_pct == 100 else ("Partially Fulfilled" if fulfillment_pct > 0 else "Pending / Zero Stock"),
            "rationale": explanation
        })

    overall_fulfillment = round(
        (total_allocated_sum / total_requested_sum * 100) if total_requested_sum > 0 else 100.0, 1
    )
    critical_fulfillment = round(
        (critical_alloc_sum / critical_req_sum * 100) if critical_req_sum > 0 else 100.0, 1
    )

    return {
        "incident_allocations": incident_allocations,
        "summary": {
            "total_requested": total_requested_sum,
            "total_allocated": total_allocated_sum,
            "overall_fulfillment_pct": overall_fulfillment,
            "critical_fulfillment_pct": critical_fulfillment,
            "initial_inventory": dict(inventory),
            "remaining_inventory": remaining_inv,
            "unmet_shortages": shortages_by_res
        },
        "status": "success",
        "message": f"Optimization finished: {total_allocated_sum} units allocated across {len(incident_allocations)} incidents."
    }
