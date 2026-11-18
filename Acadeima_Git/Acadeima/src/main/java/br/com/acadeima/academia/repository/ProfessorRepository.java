package br.com.acadeima.academia.repository;

import br.com.acadeima.academia.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {}
