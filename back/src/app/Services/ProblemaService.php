<?php

namespace App\Services;

use App\Models\CasoTeste;
use App\Models\Problema;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProblemaService
{

    private $_problema;
    private $_casos_teste = [];
    private $_is_update = false;

    public function __construct(Request $request, Problema $problema = null)
    {
        if ($problema) {
            $this->_problema = $problema;
            $this->_problema->fill($request->all());
            $this->_is_update = true;
        } else {
            $this->_problema = new Problema($request->all());
        }

        if ($request->has('casos_teste') && !empty($request->input('casos_teste'))) {
            $this->criaCasosTeste($request->input('casos_teste'));
        }
    }

    public function criaCasosTeste(array $casos_teste)
    {
        foreach ($casos_teste as $caso_teste) {
            $caso = new CasoTeste($caso_teste);
            $this->_casos_teste[] = $caso;
        }
    }

    public function salvar()
    {
        DB::beginTransaction();

        try {
            if (!$this->_problema->save()) {
                DB::rollBack();
                return false;
            }

            $existingTestCases = CasoTeste::where('problema_id', $this->_problema->id)->orderBy('id')->get();
            $newTestCasesData = $this->_casos_teste; 
            $countExisting = $existingTestCases->count();
            $countNew = count($newTestCasesData);
            
            foreach ($newTestCasesData as $index => $newCase) {
                if ($index < $countExisting) {
                    $existingCase = $existingTestCases[$index];
                    $existingCase->entrada = $newCase->entrada;
                    $existingCase->saida = $newCase->saida;
                    $existingCase->privado = $newCase->privado;
                    if (!$existingCase->save()) {
                        DB::rollback();
                        return false;
                    }
                } else {
                    $newCase->problema_id = $this->_problema->id;
                    if (!$newCase->save()) {
                        DB::rollback();
                        return false;
                    }
                }
            }

            if ($countExisting > $countNew) {
                for ($i = $countNew; $i < $countExisting; $i++) {
                    try {
                        $existingTestCases[$i]->delete();
                    } catch (Exception $e) {
                    }
                }
            }

        } catch (Exception $e) {
            DB::rollBack();
            return false;
        }

        DB::commit();
        return true;
    }

    public function getProblema()
    {
        return $this->_problema;
    }



    public static function listarTodos($user_id = null, $filtrarPorCriador = false)
    {
        $user = Auth::user();
        $canViewPrivate = $user && ($user->hasRole('admin') || $user->hasRole('professor'));

        $query = Problema::with(['casosTeste' => function ($query) use ($canViewPrivate) {
            if (!$canViewPrivate) {
                $query->where('privado', false);
            }
        }])->withCount('atividades');

        // Apenas filtra por criador se explicitamente solicitado
        if ($user_id && $filtrarPorCriador) {
            $query->where('created_by', $user_id);
        }

        return $query->get();
    }

    public static function buscarPorId($id)
    {
        $user = Auth::user();
        $canViewPrivate = $user && ($user->hasRole('admin') || $user->hasRole('professor'));

        return Problema::with(['casosTeste' => function ($query) use ($canViewPrivate) {
            if (!$canViewPrivate) {
                $query->where('privado', false);
            }
        }])->withCount('atividades')->find($id);
    }

    public static function excluir($id)
    {
        DB::beginTransaction();

        try {
            $problema = Problema::find($id);

            if (!$problema) {
                DB::rollBack();
                return false;
            }

            $atividadeIds = \App\Models\Atividade::where('problema_id', $id)->pluck('id');
            
            if ($atividadeIds->isNotEmpty()) {
                $submissaoIds = \App\Models\Submissao::whereIn('atividade_id', $atividadeIds)->pluck('id');
                
                if ($submissaoIds->isNotEmpty()) {
                    \App\Models\Correcao::whereIn('submissao_id', $submissaoIds)->delete();
                    \App\Models\Submissao::whereIn('id', $submissaoIds)->delete();
                }

                \App\Models\Atividade::whereIn('id', $atividadeIds)->delete();
            }

            $casoTesteIds = CasoTeste::where('problema_id', $id)->pluck('id');
            \App\Models\Correcao::whereIn('caso_teste_id', $casoTesteIds)->delete();
            
            CasoTeste::where('problema_id', $id)->delete();

            $problema->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            return false;
        }
    }
}
