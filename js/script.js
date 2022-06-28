const key = '8d09z3y3m1z8zA6OXbu722L0W5wTFpQPj88p8048';
let localDataApiUrl = 'https://bigdata.kepco.co.kr/openapi/v1/commonCode.do?&apiKey=8d09z3y3m1z8zA6OXbu722L0W5wTFpQPj88p8048&returnType=json'.split('?');
let dataApiUrl = 'https://bigdata.kepco.co.kr/openapi/v1/EVcharge.do?&returnType=json'.split('?');
let corsOrigin = 'https://protected-chamber-94219.herokuapp.com/';
let metro = 'metroCd',
    city = 'cityCd';

let dataValKey = [];
let pageNum = 0;
let markerArr = [];


// JSON - 구/군 api
// https://bigdata.kepco.co.kr/openapi/v1/commonCode.do?codeTy=cityCd&&apiKey=8d09z3y3m1z8zA6OXbu722L0W5wTFpQPj88p8048&returnType=json

// JSON - 시/도 api
// https://bigdata.kepco.co.kr/openapi/v1/commonCode.do?codeTy=metroCd&&apiKey=8d09z3y3m1z8zA6OXbu722L0W5wTFpQPj88p8048&returnType=json



// 카카오 맵 api
let kakaoKey = '5f1a520937f51ea9e1505b61cdde0131';
let geocoder = new daum.maps.services.Geocoder();
let markerVal = false;
let map;



document.addEventListener('DOMContentLoaded', () => {
  let mapContainer = document.getElementById('map');
  let mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
  };

  map = new kakao.maps.Map(mapContainer, mapOption);
  let zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
});






// 지역 선택 코드 데이터
function localdataFuc(v) {
  let url = `${localDataApiUrl[0]}?codeTy=${v}${localDataApiUrl[1]}`;
  return fetch(corsOrigin + url, {
    method: 'GET',
    headers: {
      'Access-Control-Allow-Origin': corsOrigin + `${url}`,
    }, 
  }).then(response => {
    return response.json();
  });
};

// 선택한 지역 전기차 충전소 데이터
function elDataFuc(v) {
  let url = `${dataApiUrl[0]}?${metro}=${v[0]}&${city}=${v[1]}&apiKey=${key}${dataApiUrl[1]}`;
  return fetch(corsOrigin + url, {
    method: 'GET',
    headers: {
      'Access-Control-Allow-Origin': corsOrigin + `${url}`,
    }, 
  }).then(response => {
    return response.json();
  })
}

// 지역 선택 change 이벤트
function cityFnc(e) {
  let target = e.currentTarget.options[e.currentTarget.selectedIndex].value;
  dataValKey[0] = target;

  cityDataFuc(target);
};

function citySelectFuc(e) {
  let target = e.currentTarget.options[e.currentTarget.selectedIndex].value;
  const btn = document.querySelector('.search_btn');
  dataValKey[1] = target;

  dataValKey.length === 2 ? btn.disabled = false : btn.disabled = true;

  btn.removeEventListener('click', dataClickFuc);
  btn.addEventListener('click', dataClickFuc);
};

function dataClickFuc() {
  if(dataValKey.length === 2) {
    markerVal = false;
    pageNum = 0;
    elDataVal(dataValKey);
  };
};


async function elDataVal(v) {
  let d = await elDataFuc(v);
  const body = document.querySelector('.list_wrap');
  const { data } = d;

  console.table(data);

  if(!markerVal) {
    geocoder.addressSearch(data[0].city, function(result, status) {
      if(status === daum.maps.services.Status.OK) {
        let setCen = new daum.maps.LatLng(result[0].y, result[0].x);
        map.panTo(setCen);
      };
    });

    let level = map.getLevel();
    map.setLevel(level + 4);

    data.forEach((item, idx) => {
      const { metro, city, stnPlace, stnAddr, rapidCnt, slowCnt, carType } = item;
      geocoder.addressSearch(stnAddr, function(result, status) {
        if(status === daum.maps.services.Status.OK) {
          console.log(result, 'status');
          let coords = new daum.maps.LatLng(result[0].y, result[0].x);

          let marker = new daum.maps.Marker({
            position: coords,
            clickable: true
          });

          marker.setMap(map);
          markerArr.push(marker);
          

          let infoWindow = new kakao.maps.InfoWindow({
            content: `<div class="info_window" style="width:150px;text-align:center;padding:6px 0;">
              <span>${stnPlace}</span>
              <span>${stnAddr}</span>
            </div>`,
            removable: true
          });

          kakao.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(map, marker);
          });

        };
      });

    });

    markerVal = true;
  };

  

  if(data.length - pageNum >= 0) {
    for(let i = pageNum; i < pageNum + 10; i++) {
      if(i === 0) {
        const { metro, city, stnPlace, stnAddr, rapidCnt, slowCnt, carType } = data[i];

        body.innerHTML = `
        <li class="list_tr">
          <div class="list_td list_num"><span>${i + 1}</span></div>
          <div class="list_td"><span>${metro}</span></div>
          <div class="list_td"><span>${city}</span></div>
          <div class="list_td"><span>${stnPlace}</span></div>
          <div class="list_td word_w"><span>${stnAddr}</span></div>
          <div class="list_td list_num"><span>${rapidCnt}</span></div>
          <div class="list_td list_num"><span>${slowCnt}</span></div>
          <div class="list_td word_w"><span>${carType}</span></div>
        </li>
      `;
      } else {
        if(data[i]) {
          const { metro, city, stnPlace, stnAddr, rapidCnt, slowCnt, carType } = data[i];
      
          body.innerHTML += `
            <li class="list_tr">
              <div class="list_td list_num"><span>${i + 1}</span></div>
              <div class="list_td"><span>${metro}</span></div>
              <div class="list_td"><span>${city}</span></div>
              <div class="list_td"><span>${stnPlace}</span></div>
              <div class="list_td word_w"><span>${stnAddr}</span></div>
              <div class="list_td list_num"><span>${rapidCnt}</span></div>
              <div class="list_td list_num"><span>${slowCnt}</span></div>
              <div class="list_td word_w"><span>${carType}</span></div>
            </li>
          `;
        } 
      }
    };

    pageNum += 10;
  };
  

  body.removeEventListener('scroll', listScrollFuc);
  body.addEventListener('scroll', listScrollFuc);
}

function listScrollFuc(e) {
  let target = e.currentTarget;
  let targetH = target.offsetHeight;
  let scrollV = target.scrollTop;

  if(scrollV >= target.scrollHeight - targetH) {
    elDataVal(dataValKey);
  } else {
    return;
  };
};


async function cityDataFuc(c) {
  let cityData = await localdataFuc(city);
  const { data } = cityData;
  const selectCity = document.querySelector('#city');

  selectCity.innerHTML = `<option value="" disabled selected>군/구 선택</option>`;

  for(let i = 0; i < data.length; i++) {
    const { codeNm, code, uppoCd } = data[i];

    if(c === uppoCd) {
      selectCity.innerHTML += `<option value="${code}">${codeNm}</option>`;
    };
  };

  selectCity.removeEventListener('change', citySelectFuc);
  selectCity.addEventListener('change', citySelectFuc);
};


// 지역 선택 옵션 생성 및 전체 함수
async function metroFuc() {
  dataValKey = [];
  pageNum = 0;

  let d = await localdataFuc(metro);
  const { data } = d;
  const selectMetro = document.querySelector('#metro');
  console.table(data);

  selectMetro.innerHTML = `<option value="" disabled selected>시/도 선택</option>`;

  for(let i = 0; i < data.length; i++) {
    const { code, codeNm } = data[i];
    selectMetro.innerHTML += `<option value="${code}">${codeNm}</option>`;
  };
  
  selectMetro.removeEventListener('change', cityFnc);
  selectMetro.addEventListener('change', cityFnc);
};



















metroFuc();

