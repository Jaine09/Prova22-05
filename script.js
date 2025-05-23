document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DA PÁGINA DE CADASTRO DE USUÁRIO ---
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        const nomeInput = document.getElementById('txtNome');
        const emailCadastroInput = document.getElementById('txtEmailCadastro');
        const cepInput = document.getElementById('txtCEP');
        const enderecoInput = document.getElementById('txtEndereco');
        const senhaCadastroInput = document.getElementById('txtSenhaCadastro');
        const confirmarSenhaInput = document.getElementById('txtConfirmarSenha');
        const cadastroMessage = document.getElementById('cadastroMessage');

        if (cepInput) { // Verifica se o campo CEP existe para adicionar o listener
            cepInput.addEventListener('blur', async () => {
                const cep = cepInput.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    try {
                        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        if (!response.ok) throw new Error('CEP não encontrado');
                        const data = await response.json();
                        if (data.erro) {
                            throw new Error('CEP inválido ou não encontrado.');
                        }
                        enderecoInput.value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                        displayMessage(cadastroMessage, '');
                    } catch (error) {
                        console.error('Erro ao buscar CEP:', error);
                        enderecoInput.value = '';
                        displayMessage(cadastroMessage, error.message || 'Erro ao buscar CEP. Verifique e tente novamente.', 'error');
                    }
                } else if (cep.length > 0) {
                    enderecoInput.value = '';
                    displayMessage(cadastroMessage, 'CEP deve conter 8 números.', 'error');
                }
            });
        }

        cadastroForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!nomeInput.value.trim()) {
                displayMessage(cadastroMessage, 'Por favor, informe seu nome.', 'error'); return;
            }
            if (!isValidEmail(emailCadastroInput.value)) {
                displayMessage(cadastroMessage, 'Por favor, informe um e-mail válido.', 'error'); return;
            }
            if (cepInput && cepInput.value.replace(/\D/g, '').length !== 8) { // Verifica se cepInput existe
                displayMessage(cadastroMessage, 'Por favor, informe um CEP válido com 8 números.', 'error'); return;
            }
            if (enderecoInput && !enderecoInput.value.trim()) { // Verifica se enderecoInput existe
                displayMessage(cadastroMessage, 'Endereço não encontrado. Verifique o CEP.', 'error'); return;
            }
            if (senhaCadastroInput.value.length < 6) {
                displayMessage(cadastroMessage, 'A senha deve ter pelo menos 6 caracteres.', 'error'); return;
            }
            if (senhaCadastroInput.value !== confirmarSenhaInput.value) {
                displayMessage(cadastroMessage, 'As senhas não coincidem.', 'error'); return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const emailExistente = usuarios.find(user => user.email === emailCadastroInput.value);

            if (emailExistente) {
                displayMessage(cadastroMessage, 'Este e-mail já está cadastrado.', 'error'); return;
            }

            const novoUsuario = {
                nome: nomeInput.value.trim(),
                email: emailCadastroInput.value.trim(),
                cep: cepInput ? cepInput.value.replace(/\D/g, '') : '', // Verifica se cepInput existe
                endereco: enderecoInput ? enderecoInput.value.trim() : '', // Verifica se enderecoInput existe
                senha: senhaCadastroInput.value
            };

            usuarios.push(novoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            displayMessage(cadastroMessage, 'Cadastro realizado com sucesso! Você já pode fazer o login.', 'success');
            cadastroForm.reset();
            if(enderecoInput) enderecoInput.value = '';
        });
    }

    // --- LÓGICA DA PÁGINA DE LOGIN ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailLoginInput = document.getElementById('txtEmail');
        const senhaLoginInput = document.getElementById('txtSenha');
        const loginMessage = document.getElementById('loginMessage');

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = emailLoginInput.value.trim();
            const senha = senhaLoginInput.value;

            if (!isValidEmail(email)) {
                displayMessage(loginMessage, 'Por favor, informe um e-mail válido.', 'error'); return;
            }
            if (!senha) {
                displayMessage(loginMessage, 'Por favor, informe sua senha.', 'error'); return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuarioEncontrado = usuarios.find(user => user.email === email && user.senha === senha);

            if (usuarioEncontrado) {
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
                window.location.href = 'admin.html';
            } else {
                displayMessage(loginMessage, 'E-mail ou senha incorretos.', 'error');
            }
        });
    }

    // --- LÓGICA PARA PÁGINA ADMIN (MENU E FOOTER) ---
    const menuToggle = document.getElementById('menuToggle');
    const adminNav = document.getElementById('adminNav');

    if (menuToggle && adminNav) {
        menuToggle.addEventListener('click', () => {
            adminNav.classList.toggle('active');
        });
    }

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    if (adminNav) {
        const currentPage = window.location.pathname.split("/").pop();
        if (currentPage) {
            const navLinks = adminNav.querySelectorAll('ul li a');
            navLinks.forEach(link => {
                link.classList.remove('active-link');
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active-link');
                }
            });
        }
    }

    // --- LÓGICA PARA CADASTRO DE VOLUNTÁRIO (cadastro_voluntario.html) ---
    const formCadastroVoluntario = document.getElementById('formCadastroVoluntario');
    if (formCadastroVoluntario) {
        const voluntarioNomeInput = document.getElementById('voluntarioNome');
        const voluntarioEmailInput = document.getElementById('voluntarioEmail');
        const voluntarioCEPInput = document.getElementById('voluntarioCEP');
        const voluntarioEnderecoInput = document.getElementById('voluntarioEndereco');
        const voluntarioComplementoInput = document.getElementById('voluntarioComplemento');
        const cadastroVoluntarioMessage = document.getElementById('cadastroVoluntarioMessage');

        if (voluntarioCEPInput) {
            voluntarioCEPInput.addEventListener('input', (e) => {
                let cep = e.target.value.replace(/\D/g, '');
                if (cep.length > 8) cep = cep.substring(0, 8);
                
                let cepFormatado = cep;
                if (cep.length > 5) {
                    cepFormatado = cep.substring(0, 5) + '-' + cep.substring(5);
                }
                e.target.value = cepFormatado;

                if (cep.length === 8) {
                    buscarEnderecoViaCEPVoluntario(cep, cadastroVoluntarioMessage, voluntarioEnderecoInput);
                }
            });
        }
        
        formCadastroVoluntario.addEventListener('submit', (event) => {
            event.preventDefault();

            const nome = voluntarioNomeInput.value.trim();
            const email = voluntarioEmailInput.value.trim();
            const cep = voluntarioCEPInput ? voluntarioCEPInput.value.replace(/\D/g, '') : "";
            let endereco = voluntarioEnderecoInput.value.trim();
            const complemento = voluntarioComplementoInput.value.trim();

            if (!nome || !email || !endereco) {
                displayMessage(cadastroVoluntarioMessage, 'Nome, Email e Endereço são obrigatórios.', 'error');
                return;
            }
            if (!isValidEmail(email)) {
                 displayMessage(cadastroVoluntarioMessage, 'Formato de e-mail inválido.', 'error');
                return;
            }
            if (voluntarioCEPInput && voluntarioCEPInput.value && cep.length !== 8) {
                displayMessage(cadastroVoluntarioMessage, 'CEP inválido. Se preenchido, deve conter 8 números.', 'error');
                return;
            }

            if (complemento) {
                endereco += `, ${complemento}`;
            }
            
            const novoVoluntario = {
                id: Date.now().toString(),
                nome: nome,
                email: email,
                endereco: endereco,
            };

            let voluntariosDB = JSON.parse(localStorage.getItem('voluntariosDB')) || [];
            const emailExistente = voluntariosDB.find(v => v.email === email);
            if(emailExistente) {
                displayMessage(cadastroVoluntarioMessage, 'Este e-mail de voluntário já está cadastrado.', 'error');
                return;
            }

            voluntariosDB.push(novoVoluntario);
            localStorage.setItem('voluntariosDB', JSON.stringify(voluntariosDB));

            displayMessage(cadastroVoluntarioMessage, 'Voluntário cadastrado com sucesso!', 'success');
            formCadastroVoluntario.reset();
            voluntarioEnderecoInput.value = '';
        });
    }

    async function buscarEnderecoViaCEPVoluntario(cep, messageElement, enderecoElement) {
        displayMessage(messageElement, 'Buscando CEP...', 'info');
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('Falha ao buscar CEP.');
            const data = await response.json();

            if (data.erro) {
                displayMessage(messageElement, 'CEP não encontrado. Preencha o endereço manualmente.', 'error');
                if(enderecoElement) enderecoElement.value = '';
            } else {
                if(enderecoElement) enderecoElement.value = `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`.replace(/^,|,$/g, '').replace(/,\s*,/g, ',');
                displayMessage(messageElement, 'Endereço parcialmente preenchido. Verifique e complete.', 'success');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            displayMessage(messageElement, error.message || 'Erro ao conectar à API de CEP.', 'error');
        }
    }


    // --- LÓGICA PARA LISTA DE VOLUNTÁRIOS (lista_voluntarios.html) ---
    const voluntariosContainer = document.getElementById('voluntariosContainer');
    const filtroNomeVoluntarioInput = document.getElementById('filtroNomeVoluntario');
    const btnLimparTodosVoluntarios = document.getElementById('btnLimparTodosVoluntarios');
    const listaVoluntariosMessage = document.getElementById('listaVoluntariosMessage');

    if (voluntariosContainer) {
        // ****** INÍCIO DA FUNÇÃO RENDERVOLUNTARIOS AJUSTADA ******
        function renderVoluntarios(voluntariosArray) {
            voluntariosContainer.innerHTML = ''; 

            if (!voluntariosArray || voluntariosArray.length === 0) {
                const emptyMessageEl = document.createElement('p');
                emptyMessageEl.className = 'empty-message';
                emptyMessageEl.textContent = 'Nenhum voluntário encontrado ou correspondente ao filtro.';
                voluntariosContainer.appendChild(emptyMessageEl);
                return;
            }

            voluntariosArray.forEach(voluntario => {
                const card = document.createElement('div');
                card.className = 'voluntario-card';

                const sigId = String(voluntario.id || Date.now());

                const primaryKeywords = "person,user,profile";
                const fotoUrl = `https://source.unsplash.com/160x160/?${primaryKeywords}&sig=${sigId}`;
                
                const fallbackKeywords = "abstract,gradient,pattern";
                const fallbackFotoUrl = `https://source.unsplash.com/160x160/?${fallbackKeywords}&sig=fallback_${sigId}`;

                // Logs para depuração
                console.log(`Renderizando card para: ${voluntario.nome} (ID: ${voluntario.id})`);
                console.log(`Tentando URL principal: ${fotoUrl}`);

                card.innerHTML = `
                    <img src="${fotoUrl}" 
                         alt="Foto de ${voluntario.nome}" 
                         class="profile-pic" 
                         onerror="this.onerror=null; console.error('Erro ao carregar imagem principal: ${fotoUrl}. Tentando fallback: ${fallbackFotoUrl}'); this.src='${fallbackFotoUrl}'; this.alt='Imagem alternativa';"
                    >
                    <h3>${voluntario.nome}</h3>
                    <p><strong>Email:</strong> ${voluntario.email}</p>
                    <p><strong>Endereço:</strong> ${voluntario.endereco}</p>
                    <button class="btn-excluir" data-id="${voluntario.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                `;
                
                voluntariosContainer.appendChild(card);
            });
        }
        // ****** FIM DA FUNÇÃO RENDERVOLUNTARIOS AJUSTADA ******

        function loadAndRenderVoluntarios() {
            const voluntariosDB = JSON.parse(localStorage.getItem('voluntariosDB')) || [];
            const filtroTexto = filtroNomeVoluntarioInput ? filtroNomeVoluntarioInput.value.toLowerCase() : "";

            const voluntariosFiltrados = voluntariosDB.filter(voluntario => {
                return voluntario.nome.toLowerCase().includes(filtroTexto);
            });
            
            renderVoluntarios(voluntariosFiltrados);
        }

        loadAndRenderVoluntarios();

        if (filtroNomeVoluntarioInput) {
            filtroNomeVoluntarioInput.addEventListener('input', loadAndRenderVoluntarios);
        }

        voluntariosContainer.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.btn-excluir');
            if (targetButton) {
                const voluntarioId = targetButton.dataset.id;
                if (confirm('Tem certeza que deseja excluir este voluntário?')) {
                    let voluntariosDB = JSON.parse(localStorage.getItem('voluntariosDB')) || [];
                    voluntariosDB = voluntariosDB.filter(v => v.id !== voluntarioId);
                    localStorage.setItem('voluntariosDB', JSON.stringify(voluntariosDB));
                    if(typeof displayMessage === 'function' && listaVoluntariosMessage) {
                        displayMessage(listaVoluntariosMessage, 'Voluntário excluído com sucesso.', 'success');
                    } else {
                        console.log('Voluntário excluído com sucesso.');
                    }
                    loadAndRenderVoluntarios();
                }
            }
        });

        if (btnLimparTodosVoluntarios) {
            btnLimparTodosVoluntarios.addEventListener('click', () => {
                const voluntariosDB = JSON.parse(localStorage.getItem('voluntariosDB')) || [];
                if (voluntariosDB.length === 0) {
                     if(typeof displayMessage === 'function' && listaVoluntariosMessage) {
                        displayMessage(listaVoluntariosMessage, 'Não há voluntários para limpar.', 'info');
                     } else {
                        console.log('Não há voluntários para limpar.');
                     }
                    return;
                }
                if (confirm('ATENÇÃO: Isso apagará TODOS os voluntários cadastrados. Deseja continuar?')) {
                    localStorage.removeItem('voluntariosDB');
                     if(typeof displayMessage === 'function' && listaVoluntariosMessage) {
                        displayMessage(listaVoluntariosMessage, 'Todos os voluntários foram removidos.', 'success');
                     } else {
                        console.log('Todos os voluntários foram removidos.');
                     }
                    loadAndRenderVoluntarios();
                }
            });
        }
    } // Fim do if (voluntariosContainer)

}); // Fim do DOMContentLoaded


// As funções isValidEmail e displayMessage devem estar definidas fora deste DOMContentLoaded
// ou no início dele para serem acessíveis globalmente dentro do escopo do DOMContentLoaded.
// No seu código original, elas estão no final, o que é funcional.

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function displayMessage(element, message, type = 'error') {
    if (!element) {
        console.warn("Elemento de mensagem não encontrado para a mensagem:", message);
        return;
    }
    element.textContent = message;
    element.className = `message ${type}`;
    if (message) {
        element.style.display = 'block';
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (element.textContent === message) { 
                    element.style.display = 'none';
                    element.textContent = '';
                }
            }, 3000);
        }
    } else {
        element.style.display = 'none';
    }
}

// --- LÓGICA DE INATIVIDADE PARA ÁREA ADMIN ---
const adminWrapperElement = document.querySelector('.admin-wrapper'); // Elemento presente nas páginas admin

if (adminWrapperElement && window.location.pathname.includes('admin.html') || 
    window.location.pathname.includes('cadastro_voluntario.html') ||
    window.location.pathname.includes('lista_voluntarios.html')) {

    let inactivityTimer;
    const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos em milissegundos

    const logoutUserPorInatividade = () => {
        // Limpa dados sensíveis do usuário logado (se houver)
        localStorage.removeItem('usuarioLogado'); 
        // Opcional: localStorage.removeItem('voluntariosDB'); se quiser limpar tudo ao deslogar por inatividade
        
        alert("Você foi desconectado por inatividade. Por favor, faça o login novamente.");
        window.location.href = 'index.html';
    };

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(logoutUserPorInatividade, INACTIVITY_TIMEOUT_MS);
        // console.log("Timer de inatividade resetado/iniciado."); // Para depuração
    };

    // Eventos que resetam o timer
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true); // Use 'true' para capturing phase
    });

    // Inicia o timer quando a página admin é carregada
    resetInactivityTimer(); 
    console.log("Monitor de inatividade iniciado para páginas admin.");
}