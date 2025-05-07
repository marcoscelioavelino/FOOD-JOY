// Função para adicionar produto ao carrinho
const buttons = document.querySelectorAll('.add-to-cart');

if (buttons.length > 0) {
  buttons.forEach(button => {
    button.addEventListener('click', event => {
      const item = event.target.closest('.item');
      if (!item) return;

      const id = item.dataset.id;
      const name = item.dataset.name;
      const price = parseFloat(item.dataset.price);

      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push({ id, name, price });
      localStorage.setItem('cart', JSON.stringify(cart));

      alert(`${name} foi adicionado ao carrinho!`);
    });
  });
}

// Limpar carrinho
const clearCartButton = document.getElementById('clear-cart');
const cartList = document.getElementById('cart');
const totalPriceElement = document.getElementById('total-price');

if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    localStorage.removeItem('cart');
    if (cartList) cartList.innerHTML = '<li>Carrinho vazio.</li>';
    if (totalPriceElement) totalPriceElement.textContent = 'Total: R$ 0,00';
    alert('Carrinho esvaziado com sucesso!');
  });
}

// Carregar carrinho
if (cartList) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartList.innerHTML = '<li>Carrinho vazio.</li>';
    if (totalPriceElement) totalPriceElement.textContent = 'Total: R$ 0,00';
  } else {
    let total = 0;
    cart.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} - R$ ${item.price.toFixed(2)}`;
      cartList.appendChild(li);
      total += item.price;
    });
    if (totalPriceElement) totalPriceElement.textContent = `Total: R$ ${total.toFixed(2)}`;
  }
}

// Envio do pedido
const orderForm = document.getElementById('order-form');
const formDiv = document.getElementById('formulario-pedido');
const statusMsg = document.getElementById('mensagem-status');

if (orderForm) {
  orderForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value;
    const nome = document.getElementById('nomeCliente')?.value || '';
    const endereco = document.getElementById('enderecoCliente')?.value || '';
    const telefone = document.getElementById('telefoneCliente')?.value || '';

    if (!pagamento || cart.length === 0 || !nome || !endereco || !telefone) {
      alert('Preencha todos os campos e selecione a forma de pagamento.');
      return;
    }

    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push({
      id: Date.now(),
      data: new Date().toLocaleString(),
      produtos: cart,
      pagamento,
      nome,
      endereco,
      telefone,
      status: 'aguardando',
      recebido: false
    });

    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('ultimoPedidoEnviado', JSON.stringify({ status: 'aguardando' }));
    localStorage.removeItem('cart');

    if (formDiv) formDiv.style.display = 'none';
    if (statusMsg) statusMsg.style.display = 'block';
    if (clearCartButton) clearCartButton.style.display = 'none';
  });
}

// Página da loja - pedidos
const listaPedidos = document.getElementById('lista-pedidos');
if (listaPedidos) {
  const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');

  if (pedidos.length === 0) {
    listaPedidos.innerHTML = '<p>Nenhum pedido recebido.</p>';
  } else {
    listaPedidos.innerHTML = '';

  
    
    
    
    
    
    
    
    
    pedidos.reverse().forEach((pedido) => {
      let total = 0;
      let html = `<div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <p><strong>Data/Hora:</strong> ${pedido.data}</p>
        <p><strong>Cliente:</strong> ${pedido.nome}</p>
        <p><strong>Endereço:</strong> ${pedido.endereco}</p>
        <p><strong>Telefone:</strong> ${pedido.telefone}</p>
        <p><strong>Forma de pagamento:</strong> ${pedido.pagamento}</p>
        <ul>`;
      pedido.produtos.forEach(prod => {
        total += parseFloat(prod.price);
        html += `<li>${prod.name} - R$ ${parseFloat(prod.price).toFixed(2)}</li>`;
      });
      html += `</ul>
        <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
        <button onclick="marcarComoEnviado(${pedido.id})">Pedido Enviado</button>`;
      if (pedido.recebido) {
        html += `<p style="color:green; font-weight:bold;">Pedido recebido pelo cliente</p>`;
      }
      html += `</div>`;
      listaPedidos.innerHTML += html;
    });
  }
}

// Marcar pedido como enviado
function marcarComoEnviado(idPedido) {
  const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  const atualizado = pedidos.map(p => p.id === idPedido ? { ...p, status: 'enviado' } : p);
  localStorage.setItem('pedidos', JSON.stringify(atualizado));
  localStorage.setItem('ultimoPedidoEnviado', JSON.stringify({ status: 'enviado' }));
  alert('Pedido marcado como enviado!');
}

// Comportamento no statuspedidos.html
window.addEventListener('DOMContentLoaded', () => {
  const status = JSON.parse(localStorage.getItem('ultimoPedidoEnviado'));

  const formDiv = document.getElementById('formulario-pedido');
  const statusMsg = document.getElementById('mensagem-status');
  const statusText = document.getElementById('status-message');
  const btnConfirmar = document.getElementById('confirmar-recebimento');

  if (status && status.status === 'aguardando') {
    if (formDiv) formDiv.style.display = 'none';
    if (statusMsg) statusMsg.style.display = 'block';
    if (statusText) statusText.textContent = 'Seu pedido foi enviado com sucesso, aguarde a loja preparar e fazer o envio.';
    if (btnConfirmar) btnConfirmar.style.display = 'none';
    if (clearCartButton) clearCartButton.style.display = 'none';
  }

  if (status && status.status === 'enviado') {
    if (formDiv) formDiv.style.display = 'none';
    if (statusMsg) statusMsg.style.display = 'block';
    if (statusText) statusText.textContent = 'Seu pedido foi enviado até você, aguarde o entregador, que chegará em breve.';
    if (btnConfirmar) {
      btnConfirmar.style.display = 'block';
      btnConfirmar.addEventListener('click', () => {
        localStorage.removeItem('ultimoPedidoEnviado');
        localStorage.removeItem('cart');
        if (statusText) statusText.textContent = 'Pedido entregue com sucesso! Obrigado por comprar conosco.';
        if (btnConfirmar) btnConfirmar.style.display = 'none';

        const cartList = document.getElementById('cart');
        const totalPrice = document.getElementById('total-price');
        if (cartList) cartList.innerHTML = '<li>Carrinho vazio.</li>';
        if (totalPrice) totalPrice.textContent = 'Total: R$ 0,00';

        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        if (pedidos.length > 0) {
          const ultimo = pedidos[pedidos.length - 1];
          ultimo.recebido = true;
          localStorage.setItem('pedidos', JSON.stringify(pedidos));
        }
      });
    }
    if (clearCartButton) clearCartButton.style.display = 'none';
  }
});










document.getElementById('limpar-pedidos').addEventListener('click', () => {
  if (confirm('Tem certeza que deseja apagar todos os pedidos?')) {
    localStorage.removeItem('pedidos'); // Remove todos os pedidos armazenados
    alert('Todos os pedidos foram apagados!');
    location.reload(); // Atualiza a página para refletir a mudança
  }
});
