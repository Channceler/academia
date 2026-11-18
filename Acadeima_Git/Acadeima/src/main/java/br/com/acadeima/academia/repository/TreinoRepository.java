package br.com.acadeima.academia.repository;

import br.com.acadeima.academia.model.Treino;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TreinoRepository extends JpaRepository<Treino, Long> {
    void deleteByAlunoId(Long alunoId);
}
