SELECT p.city, count(r.*) AS total_reservations
FROM reservations AS r
JOIN properties AS p ON p.id = r.property_id 
GROUP BY p.city
ORDER BY total_reservations DESC;