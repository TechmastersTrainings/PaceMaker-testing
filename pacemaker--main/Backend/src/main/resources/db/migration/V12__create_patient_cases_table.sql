CREATE TABLE patient_cases (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(255) NOT NULL,
    system_subject VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

-- Seed initial patient cases
INSERT INTO patient_cases (name, description, difficulty, system_subject) VALUES
('52yo Male: Chest Pain', 'Patient presents with crushing chest pain radiating to the left arm. Suspected coronary syndrome.', 'Medium', 'chest_pain'),
('28yo Female: Acute Abdomen', 'Patient reports severe right lower quadrant pain and mild fever. Diagnostic dilemma.', 'Advanced', 'abdominal_pain'),
('68yo Male: Severe Dyspnea', 'Decompensated heart failure vs acute pulmonary exacerbation. Student must evaluate fluid overload.', 'Medium', 'shortness_of_breath');
