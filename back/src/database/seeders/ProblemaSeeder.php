<?php

namespace Database\Seeders;

use App\Models\Atividade;
use App\Models\CasoTeste;
use App\Models\Problema;
use App\Models\Professor;
use App\Models\Submissao;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProblemaSeeder extends Seeder
{
    public function run(): void
    {
        $prof1 = Professor::where('area_atuacao', 'Engenharia de Software')->first();
        $prof2 = Professor::where('area_atuacao', 'Banco de Dados')->first();

        // ==========================================
        // PROBLEMA 1: Soma de dois números
        // ==========================================
        $p1 = Problema::create([
            'titulo' => 'Soma de Dois Números',
            'enunciado' => 'Leia dois números inteiros A e B e imprima a soma deles.',
            'tempo_limite' => 1000,
            'memoria_limite' => 256000,
            'privado' => false,
            'created_by' => $prof1?->id,
        ]);

        CasoTeste::create(['entrada' => "2\n3", 'saida' => '5', 'privado' => false, 'problema_id' => $p1->id]);
        CasoTeste::create(['entrada' => "0\n0", 'saida' => '0', 'privado' => false, 'problema_id' => $p1->id]);
        CasoTeste::create(['entrada' => "-5\n10", 'saida' => '5', 'privado' => true, 'problema_id' => $p1->id]);
        CasoTeste::create(['entrada' => "1000000\n999999", 'saida' => '1999999', 'privado' => true, 'problema_id' => $p1->id]);

        // ==========================================
        // PROBLEMA 2: Número par ou ímpar
        // ==========================================
        $p2 = Problema::create([
            'titulo' => 'Par ou Ímpar',
            'enunciado' => 'Leia um número inteiro N e imprima "par" se N for par ou "impar" caso contrário.',
            'tempo_limite' => 1000,
            'memoria_limite' => 256000,
            'privado' => false,
            'created_by' => $prof1?->id,
        ]);

        CasoTeste::create(['entrada' => '4', 'saida' => 'par', 'privado' => false, 'problema_id' => $p2->id]);
        CasoTeste::create(['entrada' => '7', 'saida' => 'impar', 'privado' => false, 'problema_id' => $p2->id]);
        CasoTeste::create(['entrada' => '0', 'saida' => 'par', 'privado' => true, 'problema_id' => $p2->id]);
        CasoTeste::create(['entrada' => '-3', 'saida' => 'impar', 'privado' => true, 'problema_id' => $p2->id]);

        // ==========================================
        // PROBLEMA 3: Fatorial
        // ==========================================
        $p3 = Problema::create([
            'titulo' => 'Fatorial',
            'enunciado' => 'Dado um número inteiro não-negativo N, calcule e imprima N! (fatorial de N). Lembre-se que 0! = 1.',
            'tempo_limite' => 2000,
            'memoria_limite' => 256000,
            'privado' => false,
            'created_by' => $prof2?->id,
        ]);

        CasoTeste::create(['entrada' => '0', 'saida' => '1', 'privado' => false, 'problema_id' => $p3->id]);
        CasoTeste::create(['entrada' => '5', 'saida' => '120', 'privado' => false, 'problema_id' => $p3->id]);
        CasoTeste::create(['entrada' => '1', 'saida' => '1', 'privado' => true, 'problema_id' => $p3->id]);
        CasoTeste::create(['entrada' => '10', 'saida' => '3628800', 'privado' => true, 'problema_id' => $p3->id]);
        CasoTeste::create(['entrada' => '12', 'saida' => '479001600', 'privado' => true, 'problema_id' => $p3->id]);

        // ==========================================
        // PROBLEMA 4: Fibonacci
        // ==========================================
        $p4 = Problema::create([
            'titulo' => 'N-ésimo Termo de Fibonacci',
            'enunciado' => 'Dado um número inteiro N (0 ≤ N ≤ 30), imprima o N-ésimo termo da sequência de Fibonacci. Considere que F(0) = 0 e F(1) = 1.',
            'tempo_limite' => 2000,
            'memoria_limite' => 256000,
            'privado' => false,
            'created_by' => $prof2?->id,
        ]);

        CasoTeste::create(['entrada' => '0', 'saida' => '0', 'privado' => false, 'problema_id' => $p4->id]);
        CasoTeste::create(['entrada' => '1', 'saida' => '1', 'privado' => false, 'problema_id' => $p4->id]);
        CasoTeste::create(['entrada' => '6', 'saida' => '8', 'privado' => false, 'problema_id' => $p4->id]);
        CasoTeste::create(['entrada' => '10', 'saida' => '55', 'privado' => true, 'problema_id' => $p4->id]);
        CasoTeste::create(['entrada' => '20', 'saida' => '6765', 'privado' => true, 'problema_id' => $p4->id]);

        // ==========================================
        // PROBLEMA 5: Inverter string
        // ==========================================
        $p5 = Problema::create([
            'titulo' => 'Inverter String',
            'enunciado' => 'Leia uma string S e imprima ela invertida.',
            'tempo_limite' => 1000,
            'memoria_limite' => 256000,
            'privado' => false,
            'created_by' => $prof1?->id,
        ]);

        CasoTeste::create(['entrada' => 'abcde', 'saida' => 'edcba', 'privado' => false, 'problema_id' => $p5->id]);
        CasoTeste::create(['entrada' => 'ifcodes', 'saida' => 'sedocfi', 'privado' => false, 'problema_id' => $p5->id]);
        CasoTeste::create(['entrada' => 'a', 'saida' => 'a', 'privado' => true, 'problema_id' => $p5->id]);
        CasoTeste::create(['entrada' => 'racecar', 'saida' => 'racecar', 'privado' => true, 'problema_id' => $p5->id]);

        // ==========================================
        // PROBLEMA 6: Maior elemento de um array
        // ==========================================
        $p6 = Problema::create([
            'titulo' => 'Maior Elemento',
            'enunciado' => 'Leia um inteiro N (quantidade de elementos) e em seguida N inteiros. Imprima o maior valor entre eles.',
            'tempo_limite' => 1000,
            'memoria_limite' => 256000,
            'privado' => true,
            'created_by' => $prof1?->id,
        ]);

        CasoTeste::create(['entrada' => "5\n3 1 4 1 5", 'saida' => '5', 'privado' => false, 'problema_id' => $p6->id]);
        CasoTeste::create(['entrada' => "3\n-1 -5 -2", 'saida' => '-1', 'privado' => false, 'problema_id' => $p6->id]);
        CasoTeste::create(['entrada' => "1\n42", 'saida' => '42', 'privado' => true, 'problema_id' => $p6->id]);
        CasoTeste::create(['entrada' => "4\n7 7 7 7", 'saida' => '7', 'privado' => true, 'problema_id' => $p6->id]);

        // ==========================================
        // ATIVIDADES vinculadas às turmas
        // ==========================================
        $turmaArch = Turma::where('nome', 'Arquitetura de Software')->first();
        $turmaNoSQL = Turma::where('nome', 'Banco de Dados NoSQL')->first();
        $turmaML = Turma::where('nome', 'Aprendizado de Máquina')->first();
        $turmaPatterns = Turma::where('nome', 'Padrões de Projeto')->first();

        // Atividades com prazo futuro
        $a1 = Atividade::create([
            'data_entrega' => now()->addDays(7),
            'problema_id' => $p1->id,
            'turma_id' => $turmaArch?->id,
        ]);

        $a2 = Atividade::create([
            'data_entrega' => now()->addDays(14),
            'problema_id' => $p2->id,
            'turma_id' => $turmaArch?->id,
        ]);

        $a3 = Atividade::create([
            'data_entrega' => now()->addDays(10),
            'problema_id' => $p3->id,
            'turma_id' => $turmaNoSQL?->id,
        ]);

        $a4 = Atividade::create([
            'data_entrega' => now()->addDays(21),
            'problema_id' => $p4->id,
            'turma_id' => $turmaML?->id,
        ]);

        // Atividade com prazo vencido
        $a5 = Atividade::create([
            'data_entrega' => now()->subDays(3),
            'problema_id' => $p5->id,
            'turma_id' => $turmaPatterns?->id,
        ]);

        $a6 = Atividade::create([
            'data_entrega' => now()->addDays(5),
            'problema_id' => $p6->id,
            'turma_id' => $turmaML?->id,
        ]);

        // ==========================================
        // SUBMISSÕES dos alunos
        // ==========================================
        $ana = User::where('email', 'ana.carolina@email.com')->first();
        $bruno = User::where('email', 'bruno.dias@email.com')->first();
        $carlos = User::where('email', 'carlos.eduardo@email.com')->first();

        // Ana - submissão aceita na atividade 1
        if ($ana && $a1) {
            Submissao::create([
                'data_submissao' => now()->subDays(1),
                'codigo' => "a = int(input())\nb = int(input())\nprint(a + b)",
                'linguagem' => 71, // Python
                'atividade_id' => $a1->id,
                'user_id' => $ana->id,
                'status_correcao_id' => 3, // Aceita
            ]);
        }

        // Ana - submissão com resposta errada na atividade 2
        if ($ana && $a2) {
            Submissao::create([
                'data_submissao' => now()->subDays(2),
                'codigo' => "n = int(input())\nif n % 2 == 0:\n    print('par')\nelse:\n    print('impar')",
                'linguagem' => 71,
                'atividade_id' => $a2->id,
                'user_id' => $ana->id,
                'status_correcao_id' => 3, // Aceita
            ]);
        }

        // Bruno - submissão pendente na atividade 3
        if ($bruno && $a3) {
            Submissao::create([
                'data_submissao' => now(),
                'codigo' => "#include <stdio.h>\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    long long fat = 1;\n    for(int i = 2; i <= n; i++) fat *= i;\n    printf(\"%lld\", fat);\n    return 0;\n}",
                'linguagem' => 50, // C
                'atividade_id' => $a3->id,
                'user_id' => $bruno->id,
                'status_correcao_id' => 1, // Na Fila
            ]);
        }

        // Carlos - submissão aceita na atividade 4
        if ($carlos && $a4) {
            Submissao::create([
                'data_submissao' => now()->subDays(5),
                'codigo' => "n = int(input())\na, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nprint(a)",
                'linguagem' => 71,
                'atividade_id' => $a4->id,
                'user_id' => $carlos->id,
                'status_correcao_id' => 3, // Aceita
            ]);
        }

        // Carlos - submissão com erro de compilação na atividade 6
        if ($carlos && $a6) {
            Submissao::create([
                'data_submissao' => now()->subDays(1),
                'codigo' => "#include <stdio.h>\nint main() {\n    int n;\n    scanf(\"%d\", &n)\n    int max = -999999;\n    for(int i=0;i<n;i++){int x;scanf(\"%d\",&x);if(x>max)max=x;}\n    printf(\"%d\",max);\n}",
                'linguagem' => 50,
                'atividade_id' => $a6->id,
                'user_id' => $carlos->id,
                'status_correcao_id' => 6, // Erro de Compilação
            ]);
        }

        // Ana - submissão na atividade vencida (atividade 5)
        if ($ana && $a5) {
            Submissao::create([
                'data_submissao' => now()->subDays(5),
                'codigo' => "s = input()\nprint(s[::-1])",
                'linguagem' => 71,
                'atividade_id' => $a5->id,
                'user_id' => $ana->id,
                'status_correcao_id' => 3, // Aceita
            ]);
        }
    }
}
