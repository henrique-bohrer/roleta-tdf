document.addEventListener('DOMContentLoaded', () => {

    // 1. SELEÇÃO DE ELEMENTOS
    const roletaContainer = document.querySelector('.roleta-container');
    const roletaCanvas = document.getElementById('roleta');
    const somGiro = document.getElementById('som-giro');
    const somPremio = document.getElementById('som-premio');
    const modalOverlay = document.getElementById('modal-overlay');
    const premioGanhoP = document.getElementById('premio-ganho');
    const fecharModalBtn = document.getElementById('fechar-modal-btn');
    const logoAnimado = document.getElementById('logo-animado');
    const ctx = roletaCanvas.getContext('2d');

    // 2. ESTADO INICIAL (com a lista de prêmios final e fixa)
    let premios = [
        { texto: 'Comissão DOBRADA', cor: '#FFE902' },
        { texto: 'Vale Almoço', cor: '#f0f0f0' },
        { texto: 'Energético', cor: '#FFE902' },
        { texto: 'Cupom PRESENTE', cor: '#f0f0f0' },
        { texto: 'Gelato', cor: '#FFE902' },
        { texto: 'Comissão TRIPLICADA', cor: '#f0f0f0' },
        { texto: 'Bombom', cor: '#FFE902' },
        { texto: 'Cupom PRESENTE', cor: '#f0f0f0' },
        { texto: 'Cupom PRESENTE', cor: '#FFE902' },
        { texto: 'Salva de Palmas', cor: '#f0f0f0' }
    ];

    let anguloAtual = 0;
    let girando = false;

    // 3. FUNÇÕES AUXILIARES
    // FUNÇÃO DE CONFETES ATUALIZADA
    function dispararConfetes() {
        // 1. A grande explosão inicial
        confetti({
            particleCount: 150,
            spread: 180,
            origin: { y: 0.6 },
            gravity: 0.5,
            colors: ['#FFE902', '#FFFFFF', '#1a1a1a'],
            flat: true,
            zIndex: 2000
        });

        // 2. Pequenas explosões aleatórias (fogos de artifício)
        const duracaoFogos = 2 * 1000;
        const fimFogos = Date.now() + duracaoFogos;

        const interval = setInterval(() => {
            if (Date.now() > fimFogos) {
                return clearInterval(interval);
            }
            confetti({
                particleCount: 5,
                angle: Math.random() * 360,
                spread: 55,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: ['#FFE902', '#FFFFFF'],
                flat: true,
                zIndex: 2000,
                gravity: 0.8
            });
        }, 150);
    }

    function mostrarModal(textoPremio) {
        premioGanhoP.textContent = textoPremio;
        modalOverlay.classList.remove('hidden');
        if (textoPremio !== 'Salva de Palmas' && textoPremio !== 'Bombom' && textoPremio !== 'Tente Outra Vez') {
            dispararConfetes();
        }
    }
    function esconderModal() {
        modalOverlay.classList.add('hidden');
    }
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // 4. LÓGICA DE DESENHO E RESPONSIVIDADE
    function desenharRoleta() {
        const numPremios = premios.length;
        if (numPremios === 0) return;

        const raio = roletaCanvas.width / (window.devicePixelRatio || 1) / 2;
        const centroX = roletaCanvas.width / 2;
        const centroY = roletaCanvas.height / 2;
        const anguloPorPremio = (2 * Math.PI) / numPremios;

        const raioDoBuraco = raio * 0.38;
        const tamanhoFonte = Math.max(10, raio * 0.06);

        ctx.clearRect(0, 0, roletaCanvas.width, roletaCanvas.height);

        premios.forEach((premio, i) => {
            const anguloInicio = i * anguloPorPremio;
            const anguloFim = (i + 1) * anguloPorPremio;
            ctx.beginPath();
            ctx.moveTo(centroX, centroY);
            ctx.arc(centroX, centroY, raio * (window.devicePixelRatio || 1), anguloInicio, anguloFim);
            ctx.closePath();
            ctx.fillStyle = premio.cor;
            ctx.fill();
            ctx.save();
            ctx.fillStyle = '#333';
            ctx.font = `600 ${tamanhoFonte * (window.devicePixelRatio || 1)}px Poppins, sans-serif`;
            ctx.translate(centroX, centroY);
            ctx.rotate(anguloInicio + anguloPorPremio / 2);
            ctx.textAlign = 'center';
            const textX = (raioDoBuraco + (raio - raioDoBuraco) / 2) * (window.devicePixelRatio || 1);
            ctx.fillText(premio.texto, textX, (tamanhoFonte / 3) * (window.devicePixelRatio || 1));
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(centroX, centroY, raioDoBuraco * (window.devicePixelRatio || 1), 0, 2 * Math.PI);
        ctx.fillStyle = '#2c2c2c';
        ctx.fill();
    }

    function configurarERedesenhar() {
        const tamanho = roletaContainer.clientWidth;
        const dpr = window.devicePixelRatio || 1;
        roletaCanvas.style.width = `${tamanho}px`;
        roletaCanvas.style.height = `${tamanho}px`;
        roletaCanvas.width = tamanho * dpr;
        roletaCanvas.height = tamanho * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        desenharRoleta();
    }

    // 5. LÓGICA DO JOGO
    function girarRoleta() {
        girando = true;
        somGiro.currentTime = 0;
        somGiro.play();
        const voltasExtras = Math.floor(Math.random() * 5) + 5;
        const anguloSorteado = Math.random() * 2 * Math.PI;
        const anguloFinal = anguloAtual + (voltasExtras * 2 * Math.PI) + anguloSorteado;
        roletaCanvas.style.transition = 'transform 5s ease-out';
        roletaCanvas.style.transform = `rotate(${anguloFinal}rad)`;

        setTimeout(() => {
            girando = false;
            logoAnimado.style.pointerEvents = 'auto';
            somGiro.pause();
            somPremio.play();
            const anguloNormalizado = anguloFinal % (2 * Math.PI);
            const anguloPorPremio = (2 * Math.PI) / premios.length;
            const anguloDoPonteiro = 3 * Math.PI / 2;
            const anguloCorrigido = (2 * Math.PI - anguloNormalizado + anguloDoPonteiro) % (2 * Math.PI);
            const indiceVencedor = Math.floor(anguloCorrigido / anguloPorPremio);

            setTimeout(() => {
                mostrarModal(premios[indiceVencedor].texto);
            }, 500);

            roletaCanvas.style.transition = 'none';
            anguloAtual = anguloNormalizado;
            roletaCanvas.style.transform = `rotate(${anguloAtual}rad)`;
        }, 5000);
    }

    function iniciarJogo() {
        if (girando) return;
        logoAnimado.classList.add('animado-final');
        logoAnimado.style.pointerEvents = 'none';
        setTimeout(girarRoleta, 800);
    }

    // 6. FUNÇÕES DE GERENCIAMENTO (REMOVIDAS)

    // 7. INICIALIZAÇÃO E EVENTOS
    logoAnimado.addEventListener('click', iniciarJogo);
    fecharModalBtn.addEventListener('click', esconderModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            esconderModal();
        }
    });

    document.fonts.ready.then(() => {
        configurarERedesenhar();
    });

    window.addEventListener('resize', debounce(configurarERedesenhar, 100));

});