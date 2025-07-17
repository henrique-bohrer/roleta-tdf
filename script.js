document.addEventListener('DOMContentLoaded', () => {

    // Seleção de Elementos
    const roletaCanvas = document.getElementById('roleta');
    const premioForm = document.getElementById('premio-form');
    const premioInput = document.getElementById('premio-input');
    const listaPremiosUl = document.getElementById('lista-premios');
    const editIndexInput = document.getElementById('edit-index');
    const somGiro = document.getElementById('som-giro');
    const somPremio = document.getElementById('som-premio');
    const modalOverlay = document.getElementById('modal-overlay');
    const premioGanhoP = document.getElementById('premio-ganho');
    const fecharModalBtn = document.getElementById('fechar-modal-btn');

    // MUDANÇA: Novo seletor para o logo animado
    const logoAnimado = document.getElementById('logo-animado');

    const ctx = roletaCanvas.getContext('2d');

    // MUDANÇA: Não precisamos mais carregar o logo no JS

    let premios = [
        { texto: 'Mentoria Gratuita', cor: '#FFE902' },
        { texto: '50% OFF - Curso', cor: '#f0f0f0' },
        { texto: 'E-book Exclusivo', cor: '#FFE902' },
        { texto: 'Vaga na Imersão', cor: '#f0f0f0' },
        { texto: 'Análise de Vídeo', cor: '#FFE902' },
        { texto: 'Tente Outra Vez', cor: '#f0f0f0' },
    ];

    let anguloAtual = 0;
    let girando = false;

    // Funções do Modal e Confetes (sem alterações)
    function dispararConfetes() {
        const duracao = 3 * 1000;
        const fim = Date.now() + duracao;
        const cores = ['#FFE902', '#FFFFFF', '#1a1a1a'];
        (function frame() {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: cores, flat: true, zIndex: 2000 });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: cores, flat: true, zIndex: 2000 });
            if (Date.now() < fim) { requestAnimationFrame(frame); }
        }());
    }
    function mostrarModal(textoPremio) {
        premioGanhoP.textContent = textoPremio;
        modalOverlay.classList.remove('hidden');
        if (textoPremio !== 'Tente Outra Vez') { dispararConfetes(); }
    }
    function esconderModal() {
        modalOverlay.classList.add('hidden');
    }

    // Função de Desenho da Roleta (simplificada)
    function desenharRoleta() {
        const numPremios = premios.length;
        if (numPremios === 0) return;

        const anguloPorPremio = (2 * Math.PI) / numPremios;
        const centroX = roletaCanvas.width / 2;
        const centroY = roletaCanvas.height / 2;
        const raio = roletaCanvas.width / 2;
        const raioDoBuraco = 95;

        ctx.clearRect(0, 0, roletaCanvas.width, roletaCanvas.height);

        premios.forEach((premio, i) => {
            const anguloInicio = i * anguloPorPremio;
            const anguloFim = (i + 1) * anguloPorPremio;
            ctx.beginPath();
            ctx.moveTo(centroX, centroY);
            ctx.arc(centroX, centroY, raio, anguloInicio, anguloFim);
            ctx.closePath();
            ctx.fillStyle = premio.cor;
            ctx.fill();
            ctx.stroke();
            ctx.save();
            ctx.fillStyle = '#333';
            ctx.font = '600 15px Poppins, sans-serif';
            ctx.translate(centroX, centroY);
            ctx.rotate(anguloInicio + anguloPorPremio / 2);
            ctx.textAlign = 'center';
            const textX = raioDoBuraco + (raio - raioDoBuraco) / 2;
            ctx.fillText(premio.texto, textX, 5);
            ctx.restore();
        });

        // MUDANÇA: Não desenhamos mais o logo aqui, apenas o buraco
        ctx.beginPath();
        ctx.arc(centroX, centroY, raioDoBuraco, 0, 2 * Math.PI);
        ctx.fillStyle = '#2c2c2c';
        ctx.fill();
    }

    // Função de Girar (com o bug corrigido)
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
            logoAnimado.style.pointerEvents = 'auto'; // Permite clicar novamente
            somGiro.pause();
            somPremio.play();
            const anguloNormalizado = anguloFinal % (2 * Math.PI);
            const anguloPorPremio = (2 * Math.PI) / premios.length;

            // ================== A CORREÇÃO DO BUG ESTÁ AQUI ==================
            // O ponteiro está em 270 graus (topo), que é (3 * PI / 2) radianos.
            const anguloDoPonteiro = 3 * Math.PI / 2;
            const anguloCorrigido = (2 * Math.PI - anguloNormalizado + anguloDoPonteiro) % (2 * Math.PI);
            const indiceVencedor = Math.floor(anguloCorrigido / anguloPorPremio);
            // ================================================================

            setTimeout(() => {
                mostrarModal(premios[indiceVencedor].texto);
            }, 500);
            roletaCanvas.style.transition = 'none';
            anguloAtual = anguloNormalizado;
            roletaCanvas.style.transform = `rotate(${anguloAtual}rad)`;
        }, 5000); // Duração do giro
    }

    // MUDANÇA: Nova função para iniciar a animação e o giro
    function iniciarJogo() {
        if (girando) return;

        logoAnimado.classList.add('animado-final');
        logoAnimado.style.pointerEvents = 'none'; // Desabilita cliques durante a animação/giro

        // Espera a animação do logo terminar (800ms) para começar a girar a roleta
        setTimeout(girarRoleta, 800);
    }

    // ... (demais funções handle... permanecem as mesmas) ...
    function renderizarListaPremios() {
        listaPremiosUl.innerHTML = '';
        premios.forEach((premio, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${premio.texto}</span><div class="botoes-acao"><button class="btn-editar" data-index="${index}">✏️</button><button class="btn-excluir" data-index="${index}">🗑️</button></div>`;
            listaPremiosUl.appendChild(li);
        });
        document.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', handleEditar));
        document.querySelectorAll('.btn-excluir').forEach(btn => btn.addEventListener('click', handleExcluir));
    }
    function handleFormSubmit(event) {
        event.preventDefault();
        const textoPremio = premioInput.value.trim();
        const indexParaEditar = editIndexInput.value;
        if (!textoPremio) return;
        if (indexParaEditar !== '') {
            premios[indexParaEditar].texto = textoPremio;
            premioForm.querySelector('button').textContent = 'Adicionar Prêmio';
            editIndexInput.value = '';
        } else {
            const novaCor = premios.length % 2 === 0 ? '#FFE902' : '#f0f0f0';
            premios.push({ texto: textoPremio, cor: novaCor });
        }
        premioInput.value = '';
        desenharRoleta();
        renderizarListaPremios();
    }
    function handleEditar(event) {
        const index = event.target.dataset.index;
        premioInput.value = premios[index].texto;
        editIndexInput.value = index;
        premioForm.querySelector('button').textContent = 'Salvar Alteração';
        premioInput.focus();
    }
    function handleExcluir(event) {
        const index = event.target.dataset.index;
        if (confirm(`Tem certeza que deseja excluir o prêmio "${premios[index].texto}"?`)) {
            premios.splice(index, 1);
            desenharRoleta();
            renderizarListaPremios();
        }
    }

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    // MUDANÇA: O clique agora é no logo
    logoAnimado.addEventListener('click', iniciarJogo);

    premioForm.addEventListener('submit', handleFormSubmit);
    fecharModalBtn.addEventListener('click', esconderModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            esconderModal();
        }
    });

    // A inicialização agora só precisa esperar as fontes
    document.fonts.ready.then(() => {
        desenharRoleta();
        renderizarListaPremios();
    });
});