import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../CSS/Mapa/mapa.css';
import '../../CSS/Mapa/animacao.css';

// Ícone para localização do usuário
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Ícones de risco por tipo
function getDropIconByTipo(tipo) {
  let iconUrl;
  switch (tipo) {
    case 'enchente': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'; break;
    case 'deslizamento': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'; break;
    case 'queimada': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'; break;
    case 'desmatamento': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'; break;
    case 'seca': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png'; break;
    case 'chuva': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-lightblue.png'; break;
    case 'chuva_forte': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'; break;
    default: iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
  }

  return L.divIcon({
    html: `<img src="${iconUrl}" class="marker-drop" style="width:25px; height:41px;" />`,
    iconSize: [25, 41],
    className: ''
  });
}

function getCircleColorByTipo(tipo) {
  switch (tipo) {
    case 'enchente': return 'blue';
    case 'deslizamento': return 'orange';
    case 'queimada': return 'red';
    case 'desmatamento': return 'green';
    case 'seca': return 'grey';
    case 'chuva_forte': return 'darkorange';
    case 'chuva': return 'lightblue';
    default: return 'blue';
  }
}

const raioMetrosPorTipo = {
  enchente: 20000,
  deslizamento: 15000,
  queimada: 30000,
  desmatamento: 25000,
  seca: 18000,
  chuva_forte: 20000,
  chuva: 15000,
};

const limitesDoBrasil = [
  [-34.0, -74.0],
  [5.3, -32.0],
];

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
  { nome: 'Rondônia (Porto Velho)', coords: [-11.5057, -63.5800], risco: 'Secas prolongadas.', tipo: 'seca' },
  { nome: 'Roraima (Boa Vista)', coords: [2.8236, -60.6753], risco: 'Queimadas e calor extremo.', tipo: 'queimada' },
  { nome: 'Santa Catarina (Florianópolis)', coords: [-27.5954, -48.5480], risco: 'Inundações e ciclones.', tipo: 'enchente' },
  { nome: 'São Paulo (São Paulo)', coords: [-23.5505, -46.6333], risco: 'Alagamentos e deslizamentos urbanos.', tipo: 'enchente' },
  { nome: 'Sergipe (Aracaju)', coords: [-10.9472, -37.0731], risco: 'Enchentes em áreas costeiras.', tipo: 'enchente' },
  { nome: 'Tocantins (Palmas)', coords: [-10.1846, -48.3336], risco: 'Secas e queimadas frequentes.', tipo: 'queimada' },
];

const Mapa = () => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Erro ao obter localização do usuário:", err)
    );
  }, []);

  return (
    <>
      <MapContainer
        center={[-14.235, -51.9253]}
        zoom={5}
        minZoom={4}
        maxZoom={16}
        maxBounds={limitesDoBrasil}
        scrollWheelZoom={true}
        zoomControl={false}
        className="mapa-container"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {areasDeRisco.map((area, index) => (
          <React.Fragment key={index}>
            <Marker
              position={area.coords}
              icon={getDropIconByTipo(area.tipo)}
              title={`${area.nome} - ${area.risco}`}
            >
              <Popup>
                <strong>{area.nome}</strong><br />
                {area.risco}
              </Popup>
            </Marker>
            <Circle
              center={area.coords}
              radius={raioMetrosPorTipo[area.tipo] || 15000}
              pathOptions={{
                color: getCircleColorByTipo(area.tipo),
                fillColor: getCircleColorByTipo(area.tipo),
                fillOpacity: 0.15,
                weight: 2,
                className: 'pulsar-circle'
              }}
            />
          </React.Fragment>
        ))}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup><strong>Sua localização atual</strong></Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="mapa-legenda">
        <h4>Legenda</h4>
        <ul>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png" alt="Enchente" /> Enchente</li>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png" alt="Deslizamento" /> Deslizamento</li>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" alt="Queimada" /> Queimada</li>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" alt="Desmatamento" /> Desmatamento</li>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png" alt="Seca" /> Seca</li>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-lightblue.png" alt="Chuva" /> Chuva</li>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png" alt="Chuva Forte" /> Chuva Forte</li>
          <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png" alt="Você" /> Sua localização</li>
        </ul>
      </div>
    </>
  );
};

export default Mapa;
