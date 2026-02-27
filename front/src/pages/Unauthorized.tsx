import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

/**
 * Unauthorized access page
 * Displayed when user tries to access a route they don't have permission for
 */
export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
            <div className="text-center max-w-md w-full">
                <div className="mb-8">
                    <svg
                        className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-stone-900">
                    Acesso Negado
                </h1>
                <p className="mb-6 sm:mb-8 text-base sm:text-lg text-stone-600">
                    Você não tem permissão para acessar este recurso.
                </p>
                <p className="mb-6 sm:mb-8 text-sm text-stone-500">
                    Entre em contato com o administrador se você acredita que deveria ter acesso.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                    >
                        Voltar
                    </Button>
                    <Button
                        onClick={() => navigate("/")}
                    >
                        Ir para Página Inicial
                    </Button>
                </div>
            </div>
        </div>
    );
}
