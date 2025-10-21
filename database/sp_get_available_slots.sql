DELIMITER $$

CREATE PROCEDURE sp_get_available_slots(IN p_doctor_id INT, IN p_date DATE)
BEGIN
    DECLARE v_day_of_week INT;
    SET v_day_of_week = DAYOFWEEK(p_date) - 1; 
    
    SELECT 
        TIME_FORMAT(slot_time, '%H:%i') AS hora,
        NOT EXISTS (
            SELECT 1 
            FROM appointments 
            WHERE doctor_id = p_doctor_id 
            AND appointment_date = p_date 
            AND appointment_time = slot_time
            AND status_id != (SELECT status_id FROM appointment_status WHERE status_code = 'cancelada')
        ) AS disponible
    FROM (
        SELECT 
            ADDTIME(av.start_time, SEC_TO_TIME(n.n * av.slot_duration * 60)) AS slot_time
        FROM available_slots av
        CROSS JOIN (
            SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
            UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
            UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
            UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
        ) n
        WHERE av.doctor_id = p_doctor_id
        AND av.day_of_week = v_day_of_week
        AND av.is_active = TRUE
        AND ADDTIME(av.start_time, SEC_TO_TIME(n.n * av.slot_duration * 60)) < av.end_time
    ) slots
    WHERE slot_time NOT IN (
        SELECT start_time
        FROM blocked_slots
        WHERE doctor_id = p_doctor_id
        AND blocked_date = p_date
    )
    ORDER BY slot_time;
END$$

DELIMITER ;
