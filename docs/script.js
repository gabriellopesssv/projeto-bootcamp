import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ⚠️ SUBSTITUA COM SUAS CREDENCIAIS DO SUPABASE
// Em Project Settings → API do seu projeto Supabase
const SUPABASE_URL = "https://aawwgvcmrbfgawumyuql.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9MQaV6-MqE6rj--b1mvcjw_BtdX-YtK";

let supabase = null;
let supabaseConfigurado = false;

try {
  if (SUPABASE_URL !== "https://SEU-PROJETO.supabase.co" && SUPABASE_ANON_KEY !== "SUA_CHAVE_ANON") {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseConfigurado = true;
    console.log("Supabase configurado com sucesso.");
  } else {
    console.warn("Supabase não configurado. Configure as credenciais no script.js para usar favoritos.");
  }
} catch (erro) {
  console.error("Erro ao configurar Supabase:", erro);
}

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const resultado = document.getElementById("resultado");
const form = document.getElementById("search-form");
const campo = document.getElementById("campo-busca");
const listaFavoritos = document.getElementById("lista-favoritos");
const contadorFavoritos = document.getElementById("contador-favoritos");
const btnLimparDuplicados = document.getElementById("btn-limpar-duplicados");

let favoritosCache = [];

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[caractere]));
}

function mostrarCarregando() {
  resultado.innerHTML = `
    <div class="status-state">
      <div class="spinner" aria-hidden="true"></div>
      <p>Procurando na Pokédex...</p>
    </div>
  `;
}

function mostrarErro(mensagem) {
  resultado.innerHTML = `
    <div class="status-state error">
      <div class="pokeball pokeball-sad" aria-hidden="true"><span></span></div>
      <h2>Ops, não encontramos.</h2>
      <p>${mensagem}</p>
    </div>
  `;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(/-/g, " ");
}

function mostrarToast(mensagem, tipo = "sucesso") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function salvarFavorito(nome, id, tipos, sprite) {
  if (!supabaseConfigurado) {
    mostrarToast("Configure o Supabase no script.js para usar favoritos.", "erro");
    return;
  }

  const jaFavoritado = favoritosCache.some((fav) => fav.pokemon_id === id);
  if (jaFavoritado) {
    mostrarToast("Este Pokémon já está nos seus favoritos!", "erro");
    return;
  }

  const { error } = await supabase.from("favoritos").insert({
    nome_item: nome,
    pokemon_id: id,
    tipos: tipos,
    sprite: sprite,
  });
  if (error) {
    console.error("Erro ao salvar favorito:", error);
    mostrarToast("Erro ao salvar favorito. Verifique o console.", "erro");
  } else {
    mostrarToast(`${capitalizar(nome)} adicionado aos favoritos!`, "sucesso");
    await listarFavoritos();
  }
}

async function limparDuplicados() {
  if (!supabaseConfigurado) {
    mostrarToast("Configure o Supabase no script.js para usar favoritos.", "erro");
    return;
  }

  const { data } = await supabase.from("favoritos").select("*");
  if (!data) return;

  const vistos = new Set();
  const paraRemover = [];

  data.forEach((fav) => {
    if (vistos.has(fav.pokemon_id)) {
      paraRemover.push(fav.id);
    } else {
      vistos.add(fav.pokemon_id);
    }
  });

  for (const id of paraRemover) {
    await supabase.from("favoritos").delete().eq("id", id);
  }

  if (paraRemover.length > 0) {
    mostrarToast(`Removidos ${paraRemover.length} duplicados!`, "sucesso");
    await listarFavoritos();
  } else {
    mostrarToast("Nenhum duplicado encontrado.", "sucesso");
  }
}

async function listarFavoritos() {
  if (!supabaseConfigurado) {
    if (listaFavoritos) {
      listaFavoritos.innerHTML = `
        <div class="empty-state">
          <p>Configure o Supabase no script.js para ver seus favoritos.</p>
        </div>
      `;
    }
    return;
  }

  const { data, error } = await supabase
    .from("favoritos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (!error && data) {
    favoritosCache = data;
    renderizarFavoritos(data);
    atualizarContador(data.length);
  } else if (error) {
    console.error("Erro ao listar favoritos:", error);
  }
}

function atualizarContador(qtd) {
  if (contadorFavoritos) {
    contadorFavoritos.textContent = qtd;
  }
}

async function removerFavorito(id) {
  if (!supabaseConfigurado) {
    mostrarToast("Configure o Supabase no script.js para usar favoritos.", "erro");
    return;
  }

  const { error } = await supabase.from("favoritos").delete().eq("id", id);
  if (error) {
    console.error("Erro ao remover favorito:", error);
    mostrarToast("Erro ao remover favorito.", "erro");
  } else {
    mostrarToast("Pokémon removido dos favoritos.", "sucesso");
    await listarFavoritos();
  }
}

function renderizarFavoritos(favoritos) {
  if (!listaFavoritos) return;

  if (favoritos.length === 0) {
    listaFavoritos.innerHTML = `
      <div class="empty-state">
        <p>Nenhum Pokémon favoritado ainda.</p>
      </div>
    `;
    return;
  }

  listaFavoritos.innerHTML = favoritos
    .map(
      (fav) => `
    <div class="fav-item" data-nome="${fav.nome_item}" style="cursor: pointer;">
      ${fav.sprite ? `<img src="${fav.sprite}" alt="${capitalizar(fav.nome_item)}" />` : ""}
      <div class="fav-info">
        <h3>${capitalizar(fav.nome_item)}</h3>
        <span class="fav-types">${fav.tipos || ""}</span>
      </div>
      <button class="btn-remover" data-id="${fav.id}" aria-label="Remover ${capitalizar(fav.nome_item)} dos favoritos">
        ✕
      </button>
    </div>
  `
    )
    .join("");

  listaFavoritos.querySelectorAll(".fav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (!e.target.classList.contains("btn-remover")) {
        buscarPokemon(item.dataset.nome);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  listaFavoritos.querySelectorAll(".btn-remover").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removerFavorito(parseInt(btn.dataset.id));
    });
  });
}

function montarCard(dados) {
  const tipos = dados.types
    .map((t) => {
      const cor = TYPE_COLORS[t.type.name] || "#777";
      return `<span class="type-badge" style="--type-color:${cor}">${capitalizar(t.type.name)}</span>`;
    })
    .join("");

  const tiposTexto = dados.types.map((t) => capitalizar(t.type.name)).join(", ");

  const habilidades = dados.abilities
    .slice(0, 3)
    .map((a) => capitalizar(a.ability.name))
    .join(", ");

  const sprite =
    dados.sprites?.other?.["official-artwork"]?.front_default ||
    dados.sprites?.front_default ||
    "";

  const corPrincipal = TYPE_COLORS[dados.types[0].type.name] || "#E63946";

  let botaoFavoritar = "";
  if (supabaseConfigurado) {
    const jaFavoritado = favoritosCache.some((fav) => fav.pokemon_id === dados.id);
    const textoBotao = jaFavoritado ? "★ Favoritado" : "★ Favoritar";
    const classeBotao = jaFavoritado ? "btn-favoritar btn-favoritado" : "btn-favoritar";
    botaoFavoritar = `
        <button class="${classeBotao}" data-nome="${dados.name}" data-id="${dados.id}" data-tipos="${tiposTexto}" data-sprite="${sprite}" ${jaFavoritado ? "disabled" : ""}>
          ${textoBotao}
        </button>
      `;
  }

  resultado.innerHTML = `
    <article class="poke-card" style="--accent:${corPrincipal}">
      <div class="poke-media">
        ${sprite ? `<img src="${sprite}" alt="${capitalizar(dados.name)}" />` : ""}
        <span class="poke-number">#${String(dados.id).padStart(3, "0")}</span>
      </div>
      <div class="poke-info">
        <h2>${capitalizar(dados.name)}</h2>
        <div class="type-list">${tipos}</div>
        <dl class="stat-grid">
          <div><dt>Altura</dt><dd>${(dados.height / 10).toFixed(1)} m</dd></div>
          <div><dt>Peso</dt><dd>${(dados.weight / 10).toFixed(1)} kg</dd></div>
          <div><dt>Habilidades</dt><dd>${habilidades}</dd></div>
        </dl>
        ${botaoFavoritar}
      </div>
    </article>
  `;

  const btnFavoritar = resultado.querySelector(".btn-favoritar");
  if (btnFavoritar) {
    const jaFavoritado = favoritosCache.some((fav) => fav.pokemon_id === dados.id);
    if (!jaFavoritado) {
      btnFavoritar.addEventListener("click", () => {
        salvarFavorito(
          btnFavoritar.dataset.nome,
          parseInt(btnFavoritar.dataset.id),
          btnFavoritar.dataset.tipos,
          btnFavoritar.dataset.sprite
        );
      });
    }
  }
}

async function buscarPokemon(termo) {
  const nomeOuId = termo.toLowerCase().trim();
  if (!nomeOuId) return;

  mostrarCarregando();

  try {
    const resposta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nomeOuId)}`
    );
    if (!resposta.ok) {
      throw new Error("nao-encontrado");
    }
    const dados = await resposta.json();
    montarCard(dados);
  } catch (erro) {
    if (erro instanceof TypeError) {
      mostrarErro("A PokéAPI está fora do ar no momento. Tente de novo em instantes.");
    } else {
      mostrarErro(
        `Nenhum Pokémon encontrado para "${escaparHtml(nomeOuId)}". Confira o nome ou número.`
      );
    }
  }
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  buscarPokemon(campo.value);
});

document.querySelectorAll("[data-search]").forEach((botao) => {
  botao.addEventListener("click", () => {
    campo.value = botao.dataset.search;
    buscarPokemon(botao.dataset.search);
  });
});

if (btnLimparDuplicados) {
  btnLimparDuplicados.addEventListener("click", limparDuplicados);
}

listarFavoritos();
