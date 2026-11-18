package br.com.acadeima.academia.repository;

import br.com.acadeima.academia.model.Mensalidade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensalidadeRepository extends JpaRepository<Mensalidade, Long> {
    void deleteByAlunoId(Long alunoId);
    boolean existsByPlanoId(Long planoId);
}
