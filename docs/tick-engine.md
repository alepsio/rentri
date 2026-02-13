# Tick engine formulas

- distance: Haversine
- flight_time = distance / cruise_speed + turnaround
- fuel_use = distance * fuel_burn_kg_km
- fuel_cost = fuel_use * dynamic_fuel_price
- demand = base_demand * (1 - price_sensitivity*normalized_price) * reputation_factor * frequency_factor
- load_factor = clamp(demand / seats_offered)
- revenue = pax * ticket_price
- costs = fuel + airport_fees + crew + maintenance
- profit = revenue - costs

Reputation/punctuality updated slowly per tick and results emitted via websocket.
