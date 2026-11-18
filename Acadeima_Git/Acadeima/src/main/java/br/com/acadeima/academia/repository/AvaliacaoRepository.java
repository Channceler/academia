package br.com.acadeima.academia.repository;

import br.com.acadeima.academia.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    void deleteByAlunoId(Long alunoId);
}
