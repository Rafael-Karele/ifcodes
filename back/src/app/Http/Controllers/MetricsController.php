<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    public function failedJobs(): JsonResponse
    {
        $count = DB::table('failed_jobs')->count();

        return response()->json(['count' => $count]);
    }
}
