SELECT p.id AS id, title, cost_per_night, r.start_date, avg(prev.rating) AS average_rating
FROM reservations AS r
JOIN properties AS p ON r.property_id = p.id
JOIN property_reviews AS prev ON prev.property_id = p.id
WHERE r.guest_id = 1
GROUP BY p.id, r.start_date, r.end_date
HAVING r.end_date < now()::date
ORDER BY r.start_date
LIMIT 10;