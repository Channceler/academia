package br.com.acadeima.academia.controller;

import br.com.acadeima.academia.model.*;
import br.com.acadeima.academia.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final AlunoRepository alunos;
    private final PlanoRepository planos;
    private final ProfessorRepository professores;
    private final MensalidadeRepository mensalidades;
    private final TreinoRepository treinos;
    private final AvaliacaoRepository avaliacoes;

    public ApiController(AlunoRepository alunos, PlanoRepository planos, ProfessorRepository professores,
                         MensalidadeRepository mensalidades, TreinoRepository treinos,
                         AvaliacaoRepository avaliacoes) {
        this.alunos = alunos;
        this.planos = planos;
        this.professores = professores;
        this.mensalidades = mensalidades;
        this.treinos = treinos;
        this.avaliacoes = avaliacoes;
    }

    @GetMapping("/resumo")
    public Map<String, Long> resumo() {
        return Map.of(
                "alunos", alunos.count(),
                "planos", planos.count(),
                "professores", professores.count(),
                "mensalidadesPendentes", mensalidades.findAll().stream()
                        .filter(m -> "PENDENTE".equals(m.getStatus())).count(),
                "treinos", treinos.count(),
                "avaliacoes", avaliacoes.count());
    }

    @GetMapping("/alunos")
    public List<Aluno> listarAlunos() { return alunos.findAll(); }

    @PostMapping("/alunos")
    @ResponseStatus(HttpStatus.CREATED)
    public Aluno criarAluno(@Valid @RequestBody Aluno aluno) {
        aluno.setId(null);
        return alunos.save(aluno);
    }

    @PutMapping("/alunos/{id}")
    public Aluno atualizarAluno(@PathVariable Long id, @Valid @RequestBody Aluno aluno) {
        exigir(alunos.existsById(id), "Aluno");
        aluno.setId(id);
        return alunos.save(aluno);
    }

    @DeleteMapping("/alunos/{id}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirAluno(@PathVariable Long id) {
        exigir(alunos.existsById(id), "Aluno");
        mensalidades.deleteByAlunoId(id);
        treinos.deleteByAlunoId(id);
        avaliacoes.deleteByAlunoId(id);
        alunos.deleteById(id);
    }

    @GetMapping("/planos")
    public List<Plano> listarPlanos() { return planos.findAll(); }

    @PostMapping("/planos")
    @ResponseStatus(HttpStatus.CREATED)
    public Plano criarPlano(@Valid @RequestBody Plano plano) { plano.setId(null); return planos.save(plano); }

    @PutMapping("/planos/{id}")
    public Plano atualizarPlano(@PathVariable Long id, @Valid @RequestBody Plano plano) {
        exigir(planos.existsById(id), "Plano");
        plano.setId(id);
        return planos.save(plano);
    }

    @DeleteMapping("/planos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirPlano(@PathVariable Long id) {
        exigir(planos.existsById(id), "Plano");
        if (mensalidades.existsByPlanoId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Plano vinculado a mensalidades.");
        }
        planos.deleteById(id);
    }

    @GetMapping("/professores")
    public List<Professor> listarProfessores() { return professores.findAll(); }

    @PostMapping("/professores")
    @ResponseStatus(HttpStatus.CREATED)
    public Professor criarProfessor(@Valid @RequestBody Professor professor) {
        professor.setId(null);
        return professores.save(professor);
    }

    @PutMapping("/professores/{id}")
    public Professor atualizarProfessor(@PathVariable Long id, @Valid @RequestBody Professor professor) {
        exigir(professores.existsById(id), "Professor");
        professor.setId(id);
        return professores.save(professor);
    }

    @DeleteMapping("/professores/{id}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirProfessor(@PathVariable Long id) {
        exigir(professores.existsById(id), "Professor");
        List<Treino> fichasVinculadas = treinos.findAll().stream().filter(t -> t.getProfessor() != null
                && t.getProfessor().getId().equals(id)).toList();
        fichasVinculadas.forEach(t -> t.setProfessor(null));
        treinos.saveAll(fichasVinculadas);
        professores.deleteById(id);
    }

    @GetMapping("/mensalidades")
    public List<Mensalidade> listarMensalidades() { return mensalidades.findAll(); }

    @PostMapping("/mensalidades")
    @ResponseStatus(HttpStatus.CREATED)
    public Mensalidade criarMensalidade(@Valid @RequestBody Mensalidade mensalidade) {
        mensalidade.setId(null);
        mensalidade.setStatus("PENDENTE");
        mensalidade.setDataPagamento(null);
        return mensalidades.save(mensalidade);
    }

    @PutMapping("/mensalidades/{id}")
    public Mensalidade atualizarMensalidade(@PathVariable Long id, @Valid @RequestBody Mensalidade mensalidade) {
        Mensalidade atual = mensalidades.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mensalidade nao encontrada."));
        mensalidade.setId(id);
        mensalidade.setStatus(atual.getStatus());
        mensalidade.setDataPagamento(atual.getDataPagamento());
        return mensalidades.save(mensalidade);
    }

    @DeleteMapping("/mensalidades/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirMensalidade(@PathVariable Long id) {
        exigir(mensalidades.existsById(id), "Mensalidade");
        mensalidades.deleteById(id);
    }

    @PatchMapping("/mensalidades/{id}/pagar")
    @Transactional
    public Mensalidade pagarMensalidade(@PathVariable Long id) {
        Mensalidade mensalidade = mensalidades.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mensalidade nao encontrada."));
        mensalidade.setStatus("PAGA");
        mensalidade.setDataPagamento(LocalDate.now());
        return mensalidades.save(mensalidade);
    }

    @GetMapping("/treinos")
    public List<Treino> listarTreinos() { return treinos.findAll(); }

    @PostMapping("/treinos")
    @ResponseStatus(HttpStatus.CREATED)
    public Treino criarTreino(@Valid @RequestBody Treino treino) { treino.setId(null); return treinos.save(treino); }

    @PutMapping("/treinos/{id}")
    public Treino atualizarTreino(@PathVariable Long id, @Valid @RequestBody Treino treino) {
        exigir(treinos.existsById(id), "Treino");
        treino.setId(id);
        return treinos.save(treino);
    }

    @DeleteMapping("/treinos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirTreino(@PathVariable Long id) {
        exigir(treinos.existsById(id), "Treino");
        treinos.deleteById(id);
    }

    @GetMapping("/avaliacoes")
    public List<Avaliacao> listarAvaliacoes() { return avaliacoes.findAll(); }

    @PostMapping("/avaliacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public Avaliacao criarAvaliacao(@Valid @RequestBody Avaliacao avaliacao) {
        avaliacao.setId(null);
        return avaliacoes.save(avaliacao);
    }

    @PutMapping("/avaliacoes/{id}")
    public Avaliacao atualizarAvaliacao(@PathVariable Long id, @Valid @RequestBody Avaliacao avaliacao) {
        exigir(avaliacoes.existsById(id), "Avaliacao");
        avaliacao.setId(id);
        return avaliacoes.save(avaliacao);
    }

    @DeleteMapping("/avaliacoes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirAvaliacao(@PathVariable Long id) {
        exigir(avaliacoes.existsById(id), "Avaliacao");
        avaliacoes.deleteById(id);
    }

    private void exigir(boolean existe, String tipo) {
        if (!existe) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, tipo + " nao encontrado.");
        }
    }
}
