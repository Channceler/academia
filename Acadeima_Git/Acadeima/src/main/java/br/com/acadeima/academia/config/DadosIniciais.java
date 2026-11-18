package br.com.acadeima.academia.config;

import br.com.acadeima.academia.model.*;
import br.com.acadeima.academia.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DadosIniciais {
    @Bean
    CommandLineRunner carregarExemplos(AlunoRepository alunos, PlanoRepository planos,
                                       ProfessorRepository professores, MensalidadeRepository mensalidades,
                                       TreinoRepository treinos, AvaliacaoRepository avaliacoes) {
        return args -> {
            if (alunos.count() > 0) return;

            Aluno aluno = new Aluno();
            aluno.setNome("Marina Costa");
            aluno.setEmail("marina.costa@email.com");
            aluno.setTelefone("(11) 99999-1234");
            aluno.setDataNascimento(LocalDate.of(1998, 4, 12));
            aluno = alunos.save(aluno);

            Plano plano = new Plano();
            plano.setNome("Plano Essencial");
            plano.setDescricao("Acesso livre a musculacao");
            plano.setValorMensal(new BigDecimal("119.90"));
            plano.setDuracaoMeses(1);
            plano = planos.save(plano);

            Professor professor = new Professor();
            professor.setNome("Rafael Mendes");
            professor.setEspecialidade("Musculacao");
            professor.setEmail("rafael@acadeima.com");
            professor.setTelefone("(11) 98888-4321");
            professor = professores.save(professor);

            Mensalidade mensalidade = new Mensalidade();
            mensalidade.setAluno(aluno);
            mensalidade.setPlano(plano);
            mensalidade.setReferencia(LocalDate.now().toString().substring(0, 7));
            mensalidade.setVencimento(LocalDate.now().plusDays(5));
            mensalidade.setValor(plano.getValorMensal());
            mensalidades.save(mensalidade);

            Treino treino = new Treino();
            treino.setAluno(aluno);
            treino.setProfessor(professor);
            treino.setTitulo("Treino A - Superior");
            treino.setExercicios("Supino reto - 3x12\nRemada baixa - 3x12\nDesenvolvimento - 3x10");
            treinos.save(treino);

            Avaliacao avaliacao = new Avaliacao();
            avaliacao.setAluno(aluno);
            avaliacao.setDataAvaliacao(LocalDate.now());
            avaliacao.setPeso(new BigDecimal("64.5"));
            avaliacao.setAltura(new BigDecimal("1.66"));
            avaliacao.setPercentualGordura(new BigDecimal("24.0"));
            avaliacao.setObservacoes("Avaliacao inicial");
            avaliacoes.save(avaliacao);
        };
    }
}
