SELECT p.id AS id, title, cost_per_night, avg(prev.rating) AS average_rating
FROM properties AS p
JOIN property_reviews AS prev ON prev.property_id = p.id
WHERE city LIKE '%Vancouver'
GROUP BY p.id
HAVING avg(prev.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;