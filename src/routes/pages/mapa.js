// src/components/Mapa.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../CSS/Mapa/mapa.css';

// Ícones personalizados
const iconEnchente = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png', // azul escuro
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const iconDeslizamento = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png', // laranja (marrom aproximado)
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const iconQueimada = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const iconDesmatamento = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const iconSeca = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const iconChuva = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-lightblue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const iconChuvaForte = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Array com áreas de risco e seus tipos ajustados
const areasDeRisco = [
 { nome: 'Acre (Rio Branco)', coords: [-9.97499, -67.8243], risco: 'Risco de enchentes e deslizamentos.', tipo: 'enchente' },
  { nome: 'Alagoas (Maceió)', coords: [-9.66599, -35.7350], risco: 'Enchentes e deslizamentos.', tipo: 'enchente' },
  { nome: 'Amapá (Macapá)', coords: [1.4130, -51.7690], risco: 'Alagamentos durante cheias.', tipo: 'enchente' },
  { nome: 'Amazonas (Manaus)', coords: [-3.1010, -60.0250], risco: 'Cheias dos rios e alagamentos.', tipo: 'enchente' },
  { nome: 'Bahia (Salvador)', coords: [-12.9714, -38.5014], risco: 'Secas prolongadas no interior.', tipo: 'seca' },
  { nome: 'Ceará (Fortaleza)', coords: [-3.7172, -38.5433], risco: 'Secas e escassez hídrica.', tipo: 'seca' },
  { nome: 'Distrito Federal (Brasília)', coords: [-15.7942, -47.8822], risco: 'Baixa umidade e queimadas.', tipo: 'queimada' },
  { nome: 'Espírito Santo (Vitória)', coords: [-20.3155, -40.3128], risco: 'Deslizamentos em áreas de morro.', tipo: 'deslizamento' },
  { nome: 'Goiás (Goiânia)', coords: [-16.6864, -49.2648], risco: 'Queimadas e estiagens.', tipo: 'queimada' },
  { nome: 'Maranhão (São Luís)', coords: [-2.5297, -44.3028], risco: 'Alagamentos em áreas ribeirinhas.', tipo: 'enchente' },
  { nome: 'Mato Grosso (Cuiabá)', coords: [-12.6819, -56.9211], risco: 'Queimadas na região do Pantanal.', tipo: 'queimada' },
  { nome: 'Mato Grosso do Sul (Campo Grande)', coords: [-20.4431, -54.6462], risco: 'Queimadas e enchentes sazonais.', tipo: 'queimada' },
  { nome: 'Minas Gerais (Belo Horizonte)', coords: [-19.9167, -43.9345], risco: 'Rompimento de barragens e chuvas fortes.', tipo: 'chuva_forte' },
  { nome: 'Pará (Belém)', coords: [-1.4550, -48.5024], risco: 'Alagamentos e erosões.', tipo: 'enchente' },
  { nome: 'Paraíba (João Pessoa)', coords: [-7.1195, -34.8450], risco: 'Secas severas no interior.', tipo: 'seca' },
  { nome: 'Paraná (Curitiba)', coords: [-25.4296, -49.2713], risco: 'Chuvas intensas e enchentes.', tipo: 'chuva_forte' },
  { nome: 'Pernambuco (Recife)', coords: [-8.0476, -34.8770], risco: 'Deslizamentos em morros urbanos.', tipo: 'deslizamento' },
  { nome: 'Piauí (Teresina)', coords: [-5.0892, -42.8016], risco: 'Secas prolongadas.', tipo: 'seca' },
  { nome: 'Rio de Janeiro (Rio de Janeiro)', coords: [-22.9068, -43.1729], risco: 'Chuvas fortes e deslizamentos.', tipo: 'chuva_forte' },
  { nome: 'Rio Grande do Norte (Natal)', coords: [-5.7945, -35.2110], risco: 'Avanço do mar e secas.', tipo: 'seca' },
  { nome: 'Rio Grande do Sul (Porto Alegre)', coords: [-30.0346, -51.2177], risco: 'Enchentes', tipo: 'enchente' },
  { nome: 'Rondônia (Porto Velho)', coords: [-11.5057, -63.5800], risco: 'Desmatamento e queimadas.', tipo: 'desmatamento' },
  { nome: 'Roraima (Boa Vista)', coords: [2.8236, -60.6753], risco: 'Queimadas e calor extremo.', tipo: 'queimada' },
  { nome: 'Santa Catarina (Florianópolis)', coords: [-27.5954, -48.5480], risco: 'Inundações e ciclones.', tipo: 'enchente' },
  { nome: 'São Paulo (São Paulo)', coords: [-23.5505, -46.6333], risco: 'Alagamentos e deslizamentos urbanos.', tipo: 'enchente' },
  { nome: 'Sergipe (Aracaju)', coords: [-10.9472, -37.0731], risco: 'Enchentes em áreas costeiras.', tipo: 'enchente' },
  { nome: 'Tocantins (Palmas)', coords: [-10.1846, -48.3336], risco: 'Secas e queimadas frequentes.', tipo: 'queimada' },
];

function getIconByTipo(tipo) {
  switch(tipo) {
    case 'enchente':
      return iconEnchente;
    case 'deslizamento':
      return iconDeslizamento;
    case 'queimada':
      return iconQueimada;
    case 'desmatamento':
      return iconDesmatamento;
    case 'seca':
      return iconSeca;
    case 'chuva':
      return iconChuva;
    case 'chuva_forte':
      return iconChuvaForte;
    default:
      return iconEnchente;
  }
}

const limitesDoBrasil = [
  [-34.0, -74.0],
  [5.3, -32.0],
];

const Mapa = () => {
  return (
    <MapContainer
      center={[-14.235, -51.9253]}
      zoom={5}
      minZoom={4}
      maxZoom={16}
      maxBounds={limitesDoBrasil}
      scrollWheelZoom={true}
      zoomControl={false}  // Remove os botões padrão de zoom
      className="mapa-container"
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {areasDeRisco.map((area, index) => (
        <Marker
          key={index}
          position={area.coords}
          icon={getIconByTipo(area.tipo)}
        >
          <Popup>
            <strong>{area.nome}</strong><br />
            {area.risco}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Mapa;
