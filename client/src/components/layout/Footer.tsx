export default function Footer() {
    return (
        <footer className="flex w-screen flex-col items-center justify-center bg-gray-800 p-8">
            <div className="flex w-full max-w-6xl justify-evenly border-b border-gray-700 py-10 text-sm text-gray-400">
                <div className="flex flex-1 flex-col gap-2">
                    <h2 className="text-lg text-white">Medicfy</h2>
                    <p>
                        La plataforma que conecta médicos y pacientes para
                        brindar una experiencia médica integral y personalizada
                    </p>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    <h2 className="text-lg text-white">Recursos</h2>
                    <ul className="space-y-2">
                        <li>Doctores</li>
                        <li>Clínicas</li>
                        <li>Laboratorios</li>
                        <li>Portal de Laboratorio</li>
                    </ul>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    <h2 className="text-lg text-white">Legal</h2>
                    <ul className="space-y-2">
                        <li>Términos y condiciones</li>
                        <li>Políticas de privacidad</li>
                        <li>Políticas de uso</li>
                    </ul>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    <h2 className="text-lg text-white">Contacto</h2>
                    <ul className="space-y-2">
                        <li>contacto@medicfy.com</li>
                        <li>+52 (55) 1234-5678</li>
                    </ul>
                </div>
            </div>
            <div className="flex w-full max-w-6xl py-6">
                <p className="w-full text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Medicfy. Todos los derechos
                    reservados.
                </p>
            </div>
        </footer>
    );
}
