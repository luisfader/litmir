/* Карта Мендосы — раздел романов «Тайна семьи Фадер» и «Дикий час 2: Духи гор».
   LitmirMendoza.map(el, {slug}) рисует карту (SVG, всё кодом) и точки мест из романа:
   у каждой точки — что там происходит в романе и чем место знаменито в реальности.
   Проекция «рыбий глаз»: центр Мендосы крупно, горы и Аконкагуа — по краям, расстояния сжаты логарифмически. */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const KIND = {
  city:{t:"Город", es:"Ciudad", cs:"Město", c:"#2f6f8f"},
  vino:{t:"Вино и виноградники", es:"Vino y viñedos", cs:"Víno a vinice", c:"#7a2e5a"},
  hist:{t:"История", es:"Historia", cs:"Historie", c:"#8a5a1e"},
  park:{t:"Парки и праздник", es:"Parques y fiesta", cs:"Parky a slavnost", c:"#3f7a34"},
  mont:{t:"Горы и вода", es:"Montaña y agua", cs:"Hory a voda", c:"#5a5f86"}
};
const UI = {
  ru:{zoomIn:"🔍 Центр крупнее", zoomOut:"🔍 Вся провинция", all:"Показать все места", nov:"📖 В романе", real:"🌎 В реальности", ch:"Глава",
      L:{city:"Мендоса", acon:"Аконкагуа · 6961 м", tupu:"Тупунгато", river:"река Мендоса", lujan:"Лухан-де-Куйо", heras:"Лас-Эрас", godoy:"Годой-Крус", andes:"А Н Д Ы", cach:"Качеута", potr:"Потрерильос", chile:"дорога в Чили", n:"С", sub:"центр — крупно, горы — далеко: масштаб сжат к краям"}},
  cs:{zoomIn:"🔍 Zvětšit centrum", zoomOut:"🔍 Celá provincie", all:"Ukázat všechna místa", nov:"📖 V románu", real:"🌎 Ve skutečnosti", ch:"Kapitola",
      L:{city:"Mendoza", acon:"Aconcagua · 6961 m", tupu:"Tupungato", river:"řeka Mendoza", lujan:"Luján de Cuyo", heras:"Las Heras", godoy:"Godoy Cruz", andes:"A N D Y", cach:"Cacheuta", potr:"Potrerillos", chile:"cesta do Chile", n:"S", sub:"centrum zblízka, hory zdálky: měřítko se k okrajům zmenšuje"}},
  es:{zoomIn:"🔍 Agrandar el centro", zoomOut:"🔍 Toda la provincia", all:"Mostrar todos los lugares", nov:"📖 En la novela", real:"🌎 En la realidad", ch:"Capítulo",
      L:{city:"Mendoza", acon:"Aconcagua · 6961 m", tupu:"Tupungato", river:"río Mendoza", lujan:"Luján de Cuyo", heras:"Las Heras", godoy:"Godoy Cruz", andes:"L O S   A N D E S", cach:"Cacheuta", potr:"Potrerillos", chile:"ruta a Chile", n:"N", sub:"el centro, grande; la montaña, lejos: la escala se achica hacia los bordes"}}
};
const ui = D => UI[UI[D.lang] ? D.lang : "ru"], kt = (D, k) => KIND[k][D.lang] || KIND[k].t;
const P = {
  plaza:[-32.8895,-68.8458], espana:[-32.8935,-68.8412], km0:[-32.8872,-68.8390], patr:[-32.8930,-68.8345], gob:[-32.8985,-68.8440],
  parque:[-32.8890,-68.8630], fuente:[-32.8920,-68.8700], anfi:[-32.8990,-68.8770], uncuyo:[-32.8810,-68.8750],
  aero:[-32.8317,-68.7929], plum:[-32.8585,-68.8270], heras:[-32.8480,-68.8380], challao:[-32.8560,-68.9030], godoy:[-32.9260,-68.8450],
  lujan:[-33.0360,-68.8780], fader:[-32.9960,-68.8690], finca:[-33.0650,-68.9300], cacheuta:[-33.0170,-69.1150], potr:[-32.9580,-69.1980],
  acon:[-32.6532,-70.0109], tupu:[-33.3580,-69.7710], inca:[-32.8250,-69.9110],
  arist:[-32.8893,-68.8575], chacras:[-32.9850,-68.8720], fund:[-32.8820,-68.8320], rural:[-32.9780,-68.7930], uco:[-33.4300,-69.1700],
  guana:[-32.2800,-68.1500], gloria:[-32.8935,-68.8850], uspa:[-32.5200,-69.3000], plata:[-33.0500,-69.4300], horc:[-32.8100,-69.9400],
  malar:[-35.4700,-69.5800], russell:[-33.0350,-68.7900], cipo:[-33.0480,-68.8790], hplaza:[-32.8880,-68.8360]
};

const DATA = {
  "la-reina-de-la-vendimia": {
    lang:"es", ks:72, cy:380, wide:true, title:"La Mendoza de la reina",
    intro:"Todos los lugares de Mendoza por donde pasa «La reina de la Vendimia»: del centro de la ciudad a las lagunas de Lavalle, el pie del Aconcagua y los salares de Malargüe. Tocá un punto: vas a ver qué pasa ahí en la novela y por qué el lugar es famoso en la realidad.",
    places:[
      {id:"aero", ll:P.aero, k:"city", n:"Aeropuerto y base El Plumerillo", ch:[2,31],
        nov:"Jana aterriza en Mendoza y ve por la ventanilla una montaña más alta que todas, «blanca y solitaria, como una reina sentada en su trono». Más tarde, de la base de El Plumerillo sale un helicóptero hacia la isla: a los cuatro mil metros se le congelan las palas.",
        real:"El aeropuerto internacional de Mendoza, junto a una base aérea. Toma su nombre del Campo Histórico El Plumerillo, donde San Martín entrenó al Ejército de los Andes en 1816 y 1817."},
      {id:"hplaza", ll:P.plaza, k:"city", n:"Plaza Independencia y el hotel", ch:[3,5,6,18,31,41],
        nov:"Jana alquila un cuarto chico en un hotel antiguo frente a la plaza: techo alto, ventilador lento, cama de hierro y un balcón sobre la fuente. Ahí lee de noche el cuaderno negro de Mark. Después de la semana sin borde, la vaca de la fuente vuelve a su dueño, un tambero de Guaymallén.",
        real:"La plaza principal de Mendoza, trazada después del terremoto de 1861, con cuatro plazas satélite en las esquinas. Enfrente está el viejo Hotel Plaza, hoy Park Hyatt."},
      {id:"arist", ll:P.arist, k:"city", n:"Calle Arístides Villanueva", ch:[3,15,21,25],
        nov:"Ahí está «Mirta, Estilo & Color», la peluquería donde a Jana la tiñen de rubia trigo con reflejos de miel, entre un bar con mesas en la vereda y una heladería. Después, Jana y Julieta comen un lomito sentadas en el cordón, con los pies en la acequia.",
        real:"La calle de bares, cervecerías y restaurantes más famosa de Mendoza, en la Quinta Sección: de noche, las mesas ocupan las veredas y la ciudad sale a la calle."},
      {id:"gob", ll:P.gob, k:"hist", n:"Casa de Gobierno", ch:[4,25,41,44],
        nov:"Clara, de Canal 9, entrevista en vivo a «la reina rubia» frente a la Casa de Gobierno. Más tarde, Antonio Ferrer sube dos veces las escaleras de mármol, y al final la presidenta Irina habla desde el balcón a una plaza llena de gente que acaba de barrerla.",
        real:"La sede del gobierno de la provincia, en el Barrio Cívico, con el edificio de la Legislatura y los tribunales alrededor."},
      {id:"fund", ll:P.fund, k:"hist", n:"Ruinas de San Francisco y Área Fundacional", ch:[6,10,16,17,18,42,49],
        nov:"«Debajo de Mendoza hay otra Mendoza». Bajo las ruinas, después del sismo de la fiesta, aparece una losa removida y un acceso a criptas. Ahí Luis encuentra la piedra que respira vino, y ahí, a las nueve de la noche, Jana y Luis se encuentran entre los arcos rotos.",
        real:"Acá estuvo la ciudad colonial, fundada por Pedro del Castillo en 1561 y destruida por el terremoto del 20 de marzo de 1861. Quedan las ruinas de San Francisco, la Plaza Pedro del Castillo y un museo con las excavaciones del antiguo Cabildo bajo el piso."},
      {id:"sanmartin", ll:P.km0, k:"park", n:"Avenida San Martín: desfiles y Carrusel", ch:[4,23,24,25],
        nov:"Los carros de la Vendimia avanzan por la avenida iluminados como barcos en la noche. El día del Carrusel, a las ocho de la mañana ya no queda lugar en las veredas, y en medio de la avenida aparecen un dragón, un carruaje negro y Luis Fader con las zapatillas mojadas.",
        real:"La avenida principal de la ciudad. Por ella pasan la Vía Blanca de las Reinas, el desfile nocturno de carros iluminados, y el Carrusel, el desfile del sábado por la mañana, con gauchos, caballos y las reinas de los dieciocho departamentos."},
      {id:"gloria", ll:P.gloria, k:"park", n:"Parque San Martín y Cerro de la Gloria", ch:[4,21,43],
        nov:"La primera reunión de candidatas es en un salón del parque: «Esto no es un concurso de belleza. Es la Vendimia». Julieta lleva a Jana en su Fiat Uno por el lago, los remos y el Rosedal hasta el Cerro de la Gloria, y más tarde la cita ahí: «Hoy a las ocho. Sola».",
        real:"En lo alto del cerro está el Monumento al Ejército de los Andes, inaugurado en 1914: San Martín a caballo, soldados, cañones y la figura de la Libertad. Desde arriba se ve toda la ciudad y, al oeste, la cordillera."},
      {id:"teatro", ll:P.anfi, k:"park", n:"Teatro Griego Frank Romero Day", ch:[7,27,28,46,47],
        nov:"«No se parece a ningún teatro. No tiene techo. Es un cerro». En la fiesta de la Ciudad se abre una grieta y salen llamas doradas y violetas: las uvas de toda la provincia empiezan a brillar. En el Acto Central, el escrutinio va voto a voto entre Maipú y Godoy Cruz.",
        real:"El anfiteatro al pie de los cerros del Parque San Martín donde cada año se hace el Acto Central de la Fiesta Nacional de la Vendimia y se elige a la Reina Nacional entre las candidatas de los dieciocho departamentos."},
      {id:"chacras", ll:P.chacras, k:"vino", n:"Chacras de Coria, la casa de Sergio", ch:[3,5,11,15,22],
        nov:"«Sergio Fader. Calle de los Olmos, Chacras de Coria». La casa del padre de Luis, con galería y parral, a media hora del centro. Ahí Luis vuelve de noche con un racimo en la mano y ahí, en la cama angosta de su infancia, debajo de los dibujos de la cordillera, duerme con Jana.",
        real:"Un pueblo de Luján de Cuyo de calles arboladas, casas bajas y quintas, rodeado de bodegas. Es uno de los barrios más tranquilos y queridos del Gran Mendoza."},
      {id:"godoy", ll:P.godoy, k:"city", n:"Godoy Cruz, la tierra de Julieta", ch:[3,4,5,7],
        nov:"«Este año la de Godoy Cruz es Julieta Arancibia. Esa chica es una leona». Banda verde, caballo negro, corona de plata en el pelo negro: la rival que termina siendo la mejor amiga de Jana.",
        real:"El departamento pegado al sur de la capital, con nombre del diputado mendocino en el Congreso de Tucumán de 1816. Es la tierra del club Godoy Cruz Antonio Tomba, «el Tomba»."},
      {id:"rural", ll:P.rural, k:"vino", n:"Bodega La Rural, Maipú", ch:[12,47],
        nov:"La gala de coronación de la reina de la Ciudad: el intendente, gente del gobierno de la presidenta Irina, los intendentes de los dieciocho departamentos… y un viñatero de sombrero que baila el vals con la reina y llora porque su viña fue la que más se secó.",
        real:"Una bodega histórica de Maipú, fundada a fines del siglo XIX, que tiene uno de los museos del vino más importantes de América Latina, con prensas, toneles y herramientas de la vitivinicultura antigua."},
      {id:"russell", ll:P.russell, k:"vino", n:"La finca de Estela, Russell (Maipú)", ch:[45,47,48],
        nov:"Estela González, la reina de Maipú que no sale en las fotos, espera a Jana a las seis de la mañana con una tijera de cosecha en cada mano. El sábado gana la corona nacional, y el domingo hace en Russell, bajo el parral de la casa amarilla, el asado más grande que vio Maipú en cincuenta años.",
        real:"Un distrito rural de Maipú de callejones con álamos, acequias, viñedos y olivares. Maipú es famoso por sus bodegas, su aceite de oliva y los recorridos en bicicleta entre fincas."},
      {id:"uco", ll:P.uco, k:"vino", n:"Bodega del Valle de Uco", ch:[13,14],
        nov:"La visita de las reinas a las viñas más altas de la provincia termina en emboscada: el zonda sopla caliente desde la cordillera, el cielo se pone amarillo y seis hombres esperan a la reina rubia en una bodega de piedra y vidrio medio enterrada en la ladera.",
        real:"El valle de viñedos de altura de Tunuyán, Tupungato y San Carlos, al pie de la cordillera. Sus bodegas modernas y sus vinos de altura son de los más premiados de la Argentina. El zonda es real: un viento caliente y seco que baja de los Andes."},
      {id:"guana", ll:P.guana, k:"mont", n:"Lagunas de Guanacache, Lavalle", ch:[6,23,37],
        nov:"La leyenda de la abuela de Luis: cuando Hunuc y Huar rompieron su promesa, Xumuc, el sol de los huarpes, los castigó, se arrepintió y lloró tanto que con sus lágrimas se hicieron las lagunas. De ahí viene Ayelén, la tímida reina de Lavalle.",
        real:"Humedales en el límite de Mendoza, San Juan y San Luis, sitio Ramsar desde 1999 y tierra ancestral de los huarpes laguneros. Durante el siglo XX se fueron secando, porque el agua de los ríos se quedó río arriba."},
      {id:"potr", ll:P.potr, k:"mont", n:"Potrerillos", ch:[19,20,21,22,25,34],
        nov:"«Si es turismo, yo te llevo a Potrerillos. Al refugio. Tres días sin señal». Al amanecer, el embalse aparece de golpe en una curva, «como una piedra preciosa tirada entre los cerros». Después, en el refugio, Nátasha sostiene la cabeza de Rodrigo sobre las rodillas.",
        real:"El dique y el embalse sobre el río Mendoza, terminados a comienzos de los 2000. El lago turquesa es lugar de kayak, rafting y windsurf, y por ahí pasa la ruta a Chile."},
      {id:"uspa", ll:P.uspa, k:"mont", n:"Paramillos de Uspallata y el puesto de Don Anselmo", ch:[24,25,31,32],
        nov:"Una de las siete raíces negras de la isla se clava en los cerros pelados de Paramillos, donde hace cien años los mineros sacaban oro con la mano. Un arriero llama a la radio: vio un hilo negro bajando del cielo. Don Anselmo vive a quince kilómetros, con cuarenta cabras y un perro que se llama Presidente.",
        real:"Paramillos guarda minas antiguas y un bosque petrificado de araucarias que Charles Darwin describió en 1835. El valle de Uspallata, con sus álamos y cerros de colores, sirvió de escenario para la película «Siete años en el Tíbet»."},
      {id:"plata", ll:P.plata, k:"mont", n:"Cordón del Plata", ch:[24,31],
        nov:"Otra raíz de la isla baja sobre el cordón del Plata, «donde las vetas de cobre dormían debajo de la nieve». La isla está chupando las montañas: oro, cobre, litio.",
        real:"Un cordón montañoso frente a Luján de Cuyo, con cumbres de casi seis mil metros. Muchos andinistas lo suben para aclimatarse antes del Aconcagua."},
      {id:"horc", ll:P.horc, k:"mont", n:"Laguna de Horcones y el Aconcagua", ch:[2,28,29,30,33,36,40],
        nov:"«Horcones. La laguna de Horcones. El pie de la madre», dice la Mulánima. Jana llega descalza, con el vestido roto y negro de ceniza. Después, a cuatro mil doscientos metros, la tormenta blanca baja de la isla; Olguina espera en su puesto al fondo de la última quebrada, y el Aconcagua se despierta «como una persona muy vieja».",
        real:"La laguna de Horcones está en la entrada del Parque Provincial Aconcagua, donde empieza la ruta normal a la cumbre. El Aconcagua mide 6961 metros: es la montaña más alta de América."},
      {id:"tupu", ll:P.tupu, k:"mont", n:"Volcán Tupungato", ch:[14,31,35,40],
        nov:"En la emboscada del zonda, Jana ve las montañas tan cerca que da vértigo: el Tupungato, blanco. Después, una nube enorme queda pegada a la cordillera del Aconcagua al Tupungato, y adentro están los dos hijos de Sergio.",
        real:"Un volcán de unos 6570 metros en el límite con Chile. Le da nombre al departamento de Tupungato, en el Valle de Uco."},
      {id:"malar", ll:P.malar, k:"mont", n:"Malargüe y Las Leñas", ch:[19,31,40],
        nov:"Las raíces más lejanas de la isla se clavan en Las Leñas y en los salares de Malargüe. Al final se desclavan «con un ruido de piedra arrancada» y vuelven a la isla. Antes, Jana tenía en la agenda una gira por San Rafael, Malargüe y General Alvear.",
        real:"El sur de Mendoza: el campo volcánico de La Payunia, uno de los más grandes del mundo, el centro de esquí Las Leñas y el observatorio Pierre Auger, que estudia los rayos cósmicos."},
      {id:"challao", ll:P.challao, k:"mont", n:"Cerros del Challao", ch:[27,31],
        nov:"Después del Carrusel, Nátasha manda a Zmaj a dormir a los cerros del Challao. Lo encuentra en una quebrada, «enroscado como un gato», y vuelan juntos hacia el teatro.",
        real:"Los cerros al noroeste de la ciudad, en Las Heras, con el santuario de la Virgen de Lourdes y una vista de toda Mendoza."}
    ]
  },
  "kralovna-vinobrani": {
    lang:"cs", ks:72, cy:380, wide:true, title:"Mendoza královny",
    intro:"Všechna místa Mendozy, kudy prochází «Královna vinobraní»: od centra města přes laguny Lavalle až k úpatí Aconcaguy a solným jezerům Malargüe. Klepni na bod: uvidíš, co se tam v románu děje a čím je to místo slavné ve skutečnosti.",
    places:[
      {id:"aero", ll:P.aero, k:"city", n:"Letiště El Plumerillo", ch:[2,30],
        nov:"Jana přistává v Mendoze a z okénka vidí horu vyšší než všechny ostatní, bílou a osamělou, jako královnu na trůnu. Na konci odtud odlétá: z malé haly s nejhorší kávou v Mendoze a nejlepšími alfajores.",
        real:"Mezinárodní letiště Mendozy. Jméno má po Historickém poli El Plumerillo, kde generál San Martín v letech 1816–1817 cvičil Andskou armádu."},
      {id:"hplaza", ll:P.plaza, k:"city", n:"Náměstí Independencia a hotel", ch:[3,5,6,18,19],
        nov:"Jana si pronajme malý pokoj ve starém hotelu u náměstí: vysoký strop, pomalý ventilátor, železná postel a balkon nad fontánou. V noci tu čte Markův černý sešit.",
        real:"Hlavní náměstí Mendozy, vytyčené po zemětřesení roku 1861, se čtyřmi menšími náměstími v rozích. Naproti stojí starý Hotel Plaza, dnes Park Hyatt."},
      {id:"arist", ll:P.arist, k:"city", n:"Ulice Arístides Villanueva", ch:[3,15,20,30],
        nov:"Tady je kadeřnictví «Mirta, Estilo & Color», kde Janu obarví na pšeničnou blond s medovými odlesky. Později tu s Julietou jedí *lomito* z pojízdného stánku, sedí na obrubníku a mají nohy v acequii.",
        real:"Nejslavnější ulice barů a restaurací v Mendoze: večer zabírají stolky celé chodníky a město vychází ven."},
      {id:"gob", ll:P.gob, k:"hist", n:"Vládní palác", ch:[4],
        nov:"Clara z Canal 9 dělá s «blonďatou královnou» živý rozhovor přímo před vládním palácem.",
        real:"Sídlo vlády provincie v Občanské čtvrti (Barrio Cívico), obklopené budovami parlamentu a soudů."},
      {id:"fund", ll:P.fund, k:"hist", n:"Ruiny San Francisco a Área Fundacional", ch:[6,10,16,17,18,28,29],
        nov:"„Pod Mendozou je jiná Mendoza.“ Po otřesech během slavnosti se pod ruinami objeví odsunutá deska a vstup do krypt. Luis tu najde kámen, který dýchá vínem, a v devět večer se tu s Janou setkají mezi rozbitými oblouky.",
        real:"Zde stálo koloniální město, založené Pedrem del Castillo roku 1561 a zničené zemětřesením 20. března 1861. Zůstaly ruiny kostela San Francisco, náměstí Pedra del Castillo a muzeum s vykopávkami starého Cabilda pod podlahou."},
      {id:"sanmartin", ll:P.km0, k:"park", n:"Třída San Martín: průvody a Karusel", ch:[4,22,23],
        nov:"Vozy vinobraní jedou po třídě nasvícené jako lodě v noci. V den Karuselu už v osm ráno není na chodnících k hnutí: sto tisíc lidí, platany a uprostřed na asfaltu blonďatá královna v roztrhaných šatech.",
        real:"Hlavní třída města. Projíždí jí Vía Blanca, noční průvod královen na osvětlených vozech, a Karusel, sobotní dopolední průvod s gaučy, koňmi a královnami osmnácti okresů."},
      {id:"gloria", ll:P.gloria, k:"park", n:"Park San Martín a Cerro de la Gloria", ch:[4,20],
        nov:"Julieta veze Janu parkem: tamhle jezero, tamhle veslice, tamhle růžová zahrada. Pak vyjedou po klikaté silnici až na vrchol Cerro de la Gloria, k obrovskému pomníku.",
        real:"Na vrcholu kopce stojí Pomník Andské armády z roku 1914: generál San Martín na koni, vojáci, děla a postava Svobody. Shora je vidět celé město a na západě Kordillery."},
      {id:"teatro", ll:P.anfi, k:"park", n:"Řecké divadlo Frank Romero Day", ch:[7,26],
        nov:"Divadlo, které nemá střechu: je to celý kopec. Při slavnosti Města se otevře trhlina a z ní vyšlehnou zlaté a fialové plameny; hrozny v celé provincii se rozzáří. Při Hlavním představení se nad divadlem snáší popel.",
        real:"Amfiteátr pod kopci parku San Martín, kde se každý rok koná Hlavní představení Národní slavnosti vinobraní a volí se národní královna."},
      {id:"chacras", ll:P.chacras, k:"vino", n:"Chacras de Coria, Sergiův dům", ch:[3,5,11,15,19,20,21,30],
        nov:"Dům Luisova otce s verandou a loubím, půl hodiny od centra. Sem jezdí Jana s Luisem, odsud ji ráno vyzvedává Julieta v červeném Fiatu Uno a sem, do prázdné acequie u verandy, na konci přiteče zlatá voda.",
        real:"Klidná obec v Luján de Cuyo se stromořadími, nízkými domy a usedlostmi, obklopená vinařstvími."},
      {id:"godoy", ll:P.godoy, k:"city", n:"Godoy Cruz, Julietin domov", ch:[3,4,5,7,22],
        nov:"„Letos je za Godoy Cruz Julieta Arancibia. Ta holka je lvice.“ Zelená šerpa, černý kůň, stříbrná korunka v černých vlasech: soupeřka, ze které se stane Janina nejlepší kamarádka.",
        real:"Okres hned na jih od centra, pojmenovaný po mendozském poslanci Tukumánského kongresu z roku 1816. Domov fotbalového klubu Godoy Cruz."},
      {id:"rural", ll:P.rural, k:"vino", n:"Vinařství La Rural, Maipú", ch:[12],
        nov:"Korunovační gala královny Města: starosta, lidé z vlády prezidentky Iriny a starostové všech osmnácti okresů.",
        real:"Historické vinařství v Maipú z konce 19. století s jedním z nejvýznamnějších muzeí vína v Latinské Americe: lisy, sudy a nástroje starého vinařství."},
      {id:"cipo", ll:P.cipo, k:"hist", n:"Hráz Cipolletti", ch:[21,30],
        nov:"Ve čtyři ráno tečou všechny acequie Velké Mendozy dvanáct minut pozpátku a hlídač na hrázi vidí, jak řeka klesla o půl metru. Na konci tentýž hlídač upustí termosku: řeka se ve tmě rozzáří zlatou vodou.",
        real:"Historický jez a rozdělovací hráz na řece Mendoza z let 1889–1890, kterou postavil italský inženýr César Cipolletti. Rozvádí vodu do kanálů, z nichž žije celá oáza."},
      {id:"uco", ll:P.uco, k:"vino", n:"Vinařství v údolí Uco", ch:[13,14,19],
        nov:"Návštěva královen u nejvýše položených vinic provincie skončí přepadením: od hor fouká horká zonda, nebe zežloutne a šest mužů čeká na blonďatou královnu ve vinařství z kamene a skla, napůl zapuštěném do svahu.",
        real:"Údolí vysokohorských vinic v okresech Tunuyán, Tupungato a San Carlos pod Kordillerou. Zdejší moderní vinařství patří k nejoceňovanějším v Argentině. Zonda je skutečný horký a suchý vítr z And."},
      {id:"guana", ll:P.guana, k:"mont", n:"Laguny Guanacache, Lavalle", ch:[6,21,22,23],
        nov:"Legenda Luisovy babičky: Xumuc, slunce Huarpů, plakalo tak dlouho, až z jeho slz vznikly laguny. Odsud je Ayelén, plachá královna z Lavalle, a její babička doňa Ermelinda. A u Lavalle Jana uvidí, čím by se Mendoza stala: bílou, rozpraskanou pouští.",
        real:"Mokřady na hranici Mendozy, San Juanu a San Luis, od roku 1999 chráněné Ramsarskou úmluvou, prastará země Huarpů. Ve 20. století vysychaly, protože voda řek zůstala proti proudu."},
      {id:"potr", ll:P.potr, k:"mont", n:"Přehrada Potrerillos", ch:[23,24,28,30],
        nov:"Jeden ze sedmi kabelů ostrova se zanoří do přehrady, „jejíž tyrkysová voda dávala pít celému městu“. Luis jako obr ji v měsíčním světle vidí pod sebou jako drahokam, ponoří ruku a kabel vytrhne.",
        real:"Přehrada a nádrž na řece Mendoza dokončené na začátku 21. století. Tyrkysové jezero v horách láká na kajaky, rafting a windsurfing; vede kolem silnice do Chile."},
      {id:"uspa", ll:P.uspa, k:"mont", n:"Paramillos u Uspallaty", ch:[23,24,25,28],
        nov:"První kabel dopadne na holé kopce Paramillos, kde před sto lety horníci vybírali zlato rukama. Luis tam jede s Ferrerem a lidmi z Madridu: „Je to tady. Vidím ho. Je obrovský.“",
        real:"Na Paramillos jsou staré doly a zkamenělý les araukárií, který v roce 1835 popsal Charles Darwin. V údolí Uspallata se natáčel film «Sedm let v Tibetu»."},
      {id:"plata", ll:P.plata, k:"mont", n:"Cordón del Plata", ch:[23,24,28],
        nov:"Druhý kabel dopadne na Cordón del Plata, „kde pod sněhem spaly žíly mědi“. Měděný, mrtvý — a Luis ho přetrhne.",
        real:"Horský hřbet naproti Luján de Cuyo s vrcholy vysokými skoro šest tisíc metrů. Mnoho horolezců se tu aklimatizuje před výstupem na Aconcaguu."},
      {id:"tupu", ll:P.tupu, k:"mont", n:"Sopka Tupungato", ch:[14,23,24,28],
        nov:"Pátý a šestý kabel vedou do roklí pod Tupungatem, kde pomalu tají ledovce. Luis klekne na hřeben a trhá oběma rukama najednou; ledovce pod ním zapraskají.",
        real:"Sopka vysoká asi 6570 metrů na hranici s Chile. Dala jméno okresu Tupungato v údolí Uco."},
      {id:"malar", ll:P.malar, k:"mont", n:"Malargüe", ch:[22,23,24,28],
        nov:"Nejvzdálenější kabel: „Malargüe. Čtyři sta kilometrů na jih.“ Míří do bílých solných jezer, kde voda skrývá něco cennějšího než zlato — lithium, „bílé zlato“. Na Karuselu jede královna z Malargüe v bílém, s ozdobou z kondořího peří.",
        real:"Jih Mendozy: sopečné pole La Payunia, jedno z největších na světě, lyžařské středisko Las Leñas a observatoř Pierre Auger, která zkoumá kosmické záření."},
      {id:"horc", ll:P.horc, k:"mont", n:"Aconcagua", ch:[2,9,10,19,29,30],
        nov:"Nad Aconcaguou visí ostrov se sopkou, nejdřív jen malá šedá skvrna, pak díra bez hvězd. Mulánima vletí zlatou trhlinou dovnitř hory, a uvnitř hory není tma, ale světlo. Na konci odtud roklemi sestupuje zlatá voda.",
        real:"Nejvyšší hora Ameriky, 6961 metrů, v provinčním parku Aconcagua. Normální cesta na vrchol začíná u laguny Horcones."}
    ]
  },
  "el-misterio-de-los-fader": {
    lang:"es", title:"La Mendoza de los Fader",
    intro:"Todos los lugares de Mendoza donde transcurre «El misterio de los Fader». Tocá un punto: vas a ver qué pasa ahí en la novela y por qué ese lugar es famoso en la realidad. El color del punto indica el tipo de lugar.",
    places:[
      {id:"aero", ll:P.aero, k:"city", n:"Aeropuerto El Plumerillo", ch:[3,5], img:"novels/el-misterio-de-los-fader/img/01.jpg",
        nov:"Acá aterrizan Luis y Natalia desde Moscú. Sergio los espera en el aeropuerto, y Natalia se queda quieta: en el horizonte, las cumbres nevadas de los Andes brillan bajo el sol.",
        real:"El aeropuerto internacional de Mendoza. Toma su nombre del vecino Campo Histórico El Plumerillo, en Las Heras, donde en 1816 y 1817 el general San Martín entrenó al Ejército de los Andes antes de cruzar la cordillera."},
      {id:"plaza", ll:P.plaza, k:"city", n:"Plaza Independencia", ch:[7,9,42,43,54], img:"novels/el-misterio-de-los-fader/img/07.jpg",
        nov:"El escenario de la Vendimia, guirnaldas de hojas de parra doradas y un grito: «¡Necesitamos una reina YA! La candidata de la Sexta Sección se desmayó». Así una rusa, Natalia Fader, termina coronada. Después, acá se protesta contra el monumento a Roca, y Luis y Natalia duermen en el hotel de enfrente.",
        real:"La plaza principal de Mendoza. Después del terremoto de 1861, que destruyó la ciudad colonial, la ciudad nueva se trazó a su alrededor, con cuatro plazas satélite en las esquinas: España, Italia, Chile y San Martín. Debajo funciona el Museo de Arte Moderno; alrededor hay fuentes, ferias de artesanos y el Park Hyatt."},
      {id:"km0", ll:P.km0, k:"city", n:"Kilómetro Cero, avenida San Martín", ch:[7,40],
        nov:"«Desde acá se miden todas las distancias de la provincia. Es el corazón de Mendoza», le dice Luis a Natalia mientras pasan con el Gacel por la avenida San Martín, rumbo a la fiesta.",
        real:"El punto desde el que se cuentan las rutas de la provincia, sobre la avenida principal de la ciudad. Alrededor está el microcentro: cafés, heladerías, peatonales y el eterno paseo mendocino."},
      {id:"godoy", ll:P.godoy, k:"hist", n:"Las acequias de Godoy Cruz", ch:[8,11], img:"novels/el-misterio-de-los-fader/img/09.jpg",
        nov:"El maletín con el hidromiel cae a una acequia y viaja medio Mendoza. En un puentecito de ladrillo de Godoy Cruz la corriente lo aprieta contra una piedra… y después se lo lleva hasta la finca Fader.",
        real:"Mendoza está en medio del desierto y casi no llueve. La ciudad vive gracias a las acequias, canales con el agua del deshielo de los Andes que ya trazaban los huarpes. Sin ellas no habría árboles en las calles ni viñedos. El departamento lleva el nombre de Tomás Godoy Cruz, diputado en el Congreso de Tucumán de 1816."},
      {id:"parque", ll:P.parque, k:"park", n:"Parque General San Martín", ch:[6,10,34,40], img:"novels/el-misterio-de-los-fader/img/08.jpg",
        nov:"En la entrada del parque, un hombre de guantes y maletín negro hace un intercambio secreto. Siglo y medio después de que Karl Fader mandara esconder acá unos baúles, en la noche de la Vía Blanca el parque brilla con miles de luces y Natalia sube a su carro, pintado al estilo de Fernando Fader.",
        real:"El gran parque del oeste de la ciudad, diseñado en 1896 por el paisajista Carlos Thays: decenas de miles de árboles en pleno desierto, un lago para regatas, el rosedal, el Cerro de la Gloria con el monumento al Ejército de los Andes y los famosos portones de hierro de la entrada."},
      {id:"anfi", ll:P.anfi, k:"park", n:"Anfiteatro Frank Romero Day", ch:[46,47,48,49,50,51,52],
        nov:"El Acto Central de la Vendimia: Natalia y Carlita Martínez empatan y todo depende del último sobre. Después los guerreros mapuches toman el escenario, empieza la batalla y Luis, al romper el cetro cargado de hidromiel, se vuelve inmortal.",
        real:"El teatro griego al aire libre al pie de los cerros del Parque San Martín, con lugar para más de veinte mil personas. Cada año acá se hace el Acto Central de la Fiesta Nacional de la Vendimia y se corona a la reina nacional."},
      {id:"uncuyo", ll:P.uncuyo, k:"hist", n:"Universidad Nacional de Cuyo", ch:[35],
        nov:"De noche, en el campus vacío de la Facultad de Ciencias Políticas y Sociales, un grupo de mapuches desentierra un tesoro escondido ahí hace muchos años.",
        real:"La principal universidad de Mendoza, fundada en 1939. Su campus está pegado al Parque San Martín, cerca de los cerros y del anfiteatro de la Vendimia."},
      {id:"heras", ll:P.heras, k:"city", n:"Las Heras", ch:[45,48,51],
        nov:"De acá es Carlita Martínez, la gran rival de Natalia. La hinchada de Huracán Las Heras primero la alienta a ella y después canta para Luis en la pelea con el chamán. Al final, Carlita es la reina.",
        real:"El departamento al norte de la capital, con el nombre del general Juan Gregorio de Las Heras, héroe del Ejército de los Andes. Ahí están el Campo Histórico El Plumerillo, los cerros del Challao y el comienzo del camino a la alta montaña."},
      {id:"challao", ll:P.challao, k:"hist", n:"Santuario del Challao", ch:[41],
        nov:"De noche, María Silvana Roca entra a la vieja catedral del Challao. En el altar la esperan el chamán Lautaro y el joven guerrero Antu, con una botella de vidrio verde llena de hidromiel dorado encontrado en las ruinas de Cacheuta.",
        real:"El santuario de la Virgen de Lourdes, en los cerros del Challao, en Las Heras. Es lugar de grandes peregrinaciones: la gente sube a pie por el Vía Crucis y desde arriba se ve toda Mendoza."},
      {id:"fader", ll:P.fader, k:"vino", n:"Museo Fader (Mayor Drummond)", ch:[4,6,38,53],
        nov:"En una sala del museo, dos hombres intercambian maletines. Para Luis es un lugar especial, y no del todo grato: a los quince años participó ahí de un concurso de pintura. Al final, Karl anuncia que el museo Fader ahora es de Sergio.",
        real:"La casona de la familia Fader en Luján de Cuyo, cuyas paredes pintó al fresco Fernando Fader. Hoy es el Museo Provincial de Bellas Artes Emiliano Guiñazú, la «Casa de Fader», con jardín y una colección de pintura argentina."},
      {id:"lujan", ll:P.lujan, k:"vino", n:"Luján de Cuyo", ch:[11,17,47,52],
        nov:"Sobre los viñedos de Luján de Cuyo se levanta, como un castillo feudal, la mansión del misterioso hombre de negro. Mónica y Sergio van al centro de Luján a hacer compras, y en la Vendimia la virreina es María Voloshchin, de Luján de Cuyo.",
        real:"La «primera zona» del vino argentino y cuna del Malbec mendocino: decenas de bodegas al pie de los Andes. Fue la primera región vitivinícola de la Argentina con denominación de origen controlada."},
      {id:"finca", ll:P.finca, k:"vino", n:"Finca Fader (ficticia)", ch:[12,17,18,19,21,28,33,36,55],
        nov:"El corazón de la novela. El maletín queda trabado entre las piedras del canal del viñedo, el hidromiel se mezcla con el agua… y las uvas empiezan a brillar. Acá Luis y Natalia pintan los Andes, aparece el zorro que le muerde el trasero a Adolfo, y Karl Fader da su entrevista con el mate en una mano y el Malbec en la otra.",
        real:"La finca Fader no existe, pero se parece a muchas fincas familiares de Luján de Cuyo: casa con galería, hileras de vides, acequia y vista a los Andes nevados. La cosecha va de febrero a abril."},
      {id:"cacheuta", ll:P.cacheuta, k:"mont", n:"Ruinas de la usina de Cacheuta", ch:[14,20,21,22,27,36,41],
        nov:"El esqueleto de hormigón de la primera central hidroeléctrica de la Argentina, la que construyó el ingeniero Carlos Fader. Ahí los mapuches buscan un escondite, ahí aparecen dos gendarmes muertos, y entre las ruinas Antu encuentra el hidromiel que Karl había enterrado bajo los cimientos.",
        real:"Cacheuta es famosa por sus aguas termales junto al río Mendoza. Hubo un gran hotel termal y una usina, pero en enero de 1934 un aluvión bajó de la montaña y destruyó casi todo. Hoy funcionan ahí piletas termales."},
      {id:"potr", ll:P.potr, k:"mont", n:"Potrerillos", ch:[14,22],
        nov:"Domingo Castro, «Kurüf», maneja su Ford F-150 por el camino de cornisa a Potrerillos: a la izquierda, el río Mendoza dibuja curvas plateadas entre quebradas de piedra rojiza. Después, por esa misma ruta, una caravana de autos va hacia las ruinas de Cacheuta.",
        real:"Un pueblo junto al dique y el embalse sobre el río Mendoza, construidos a principios de los 2000. El lago turquesa en la montaña es lugar de kayak, rafting y windsurf, y por ahí pasa la ruta a Chile."},
      {id:"acon", ll:P.acon, k:"mont", n:"Aconcagua", ch:[5], far:true,
        nov:"Los Andes reciben a Natalia apenas baja del avión: cumbres nevadas en el horizonte y, entre ellas, la más alta.",
        real:"La montaña más alta de América y del mundo fuera de Asia: 6961 metros. Está en la provincia de Mendoza, dentro del Parque Provincial Aconcagua, y cada año llegan andinistas de todo el planeta."}
    ]
  },
  "tajna-semi-fader": {
    title:"Мендоса семьи Фадер",
    intro:"Все места Мендосы, где происходит «Тайна семьи Фадер». Нажми на точку: увидишь, что там случилось в романе и чем это место знаменито на самом деле. Цвет точки — тип места.",
    places:[
      {id:"aero", ll:P.aero, k:"city", n:"Аэропорт Эль-Плумерильо", ch:[3,5], img:"novels/el-misterio-de-los-fader/img/01.jpg",
        nov:"Сюда прилетают Луис и Наталья из Москвы. Серхио встречает их в аэропорту, а Наталья замирает: на горизонте — снежные вершины Анд, сияющие под солнцем.",
        real:"Международный аэропорт Мендосы. Своё имя он взял у соседнего Исторического поля Эль-Плумерильо в Лас-Эрасе: в 1816–1817 годах там тренировалась Андская армия генерала Сан-Мартина перед переходом через Анды."},
      {id:"plaza", ll:P.plaza, k:"city", n:"Площадь Независимости", ch:[7,9,42,43,54], img:"novels/el-misterio-de-los-fader/img/07.jpg",
        nov:"Праздничная сцена Вендимии, гирлянды из золотых виноградных листьев — и крик: «Нам СРОЧНО нужна королева! Участница от Шестого района упала в обморок!» Так русская Наталья Фадер становится королевой. Позже здесь протестуют против памятника Роке, а Луис и Наталья ночуют в отеле напротив площади.",
        real:"Главная площадь Мендосы. После землетрясения 1861 года, разрушившего колониальный город, новый центр построили вокруг неё, а по углам — четыре площади-спутницы: Испании, Италии, Чили и Сан-Мартина. Под площадью — Музей современного искусства, вокруг — фонтаны, ярмарки ремесленников и отель «Park Hyatt»."},
      {id:"km0", ll:P.km0, k:"city", n:"Нулевой километр, проспект Сан-Мартин", ch:[7,40,56],
        nov:"«Отсюда отсчитывают все расстояния в провинции. Это сердце Мендосы», — говорит Луис, проезжая на «Гаселе» по проспекту Сан-Мартин. В финальном интервью Хулиета садится здесь у фонтана с мате и деревянным лисом в кармане.",
        real:"Точка отсчёта дорог провинции на главной улице города — проспекте Сан-Мартин. Вокруг — микроцентр: кафе, мороженое, пешеходные улицы и вечная мендосская прогулка «пасео»."},
      {id:"espana", ll:P.espana, k:"city", n:"Площадь Испании", ch:[56],
        nov:"У площади Испании — маленькая мастерская Мауро. Он вырезал из дерева лиса и подарил его Хулиете, как раз когда по громкоговорителям объявляли «магнитную аномалию». Так начинается другая история — «Аномалия».",
        real:"Самая нарядная из площадей-спутниц: скамейки, фонтан и стены, выложенные бело-синими испанскими изразцами с картинами из истории Мендосы и Испании."},
      {id:"godoy", ll:P.godoy, k:"hist", n:"Арыки Годой-Круса", ch:[8,11], img:"novels/tajna-semi-fader/img/06.jpg",
        nov:"Портфель с медовухой падает в арык и плывёт через пол-Мендосы. У низкого кирпичного мостика в Годой-Крусе его прижимает к камню — а потом течение уносит дальше, к финке Фадер.",
        real:"Мендоса стоит посреди пустыни: дождей здесь очень мало. Город живёт благодаря арыкам (acequias) — каналам с талой водой Анд, которые прокладывали ещё индейцы уарпе. Без них не было бы ни деревьев на улицах, ни виноградников. Департамент назван в честь Томаса Годой-Круса, депутата Тукуманского конгресса 1816 года."},
      {id:"parque", ll:P.parque, k:"park", n:"Парк Генерала Сан-Мартина", ch:[6,10,34,40], img:"novels/el-misterio-de-los-fader/img/08.jpg",
        nov:"У входа в парк человек в перчатках и с чёрным портфелем совершает тайный обмен. Через полтора века после того, как Карл Фадер велел спрятать здесь сундуки, в ночь «Виа Бланки» парк сияет тысячами огней, и Наталья поднимается на колесницу, расписанную в стиле Фернандо Фадера.",
        real:"Огромный парк на западе города, спроектированный в 1896 году ландшафтным архитектором Карлосом Тэйсом: десятки тысяч деревьев посреди пустыни, озеро для регат, розарий, Холм Славы с памятником Андской армии и знаменитые кованые ворота у входа."},
      {id:"anfi", ll:P.anfi, k:"park", n:"Амфитеатр Франка Ромеро Дая", ch:[46,47,48,49,50,51,52],
        nov:"Центральный акт Вендимии: Наталья и Карлита Мартинес идут голос в голос, и всё решает последний конверт. Потом сцену захватывают воины мапуче во главе с шаманом Лаутаро, начинается битва, и Луис, разбив жезл с медовухой, становится бессмертным.",
        real:"Греческий театр под открытым небом у подножия холмов парка Сан-Мартина, на двадцать с лишним тысяч зрителей. Каждый год здесь проходит Центральный акт Национального праздника Вендимии и коронуют национальную королеву сбора винограда."},
      {id:"uncuyo", ll:P.uncuyo, k:"hist", n:"Национальный университет Куйо", ch:[35],
        nov:"Ночью на пустом кампусе факультета политических и социальных наук группа мапуче выкапывает сокровища, спрятанные здесь много лет назад.",
        real:"Главный университет Мендосы, основанный в 1939 году. Его кампус примыкает к парку Сан-Мартина, по соседству с холмами и амфитеатром Вендимии."},
      {id:"heras", ll:P.heras, k:"city", n:"Лас-Эрас", ch:[45,48,51],
        nov:"Отсюда Карлита Мартинес, «гордая индианка из Лас-Эраса», главная соперница Натальи. Болельщики «Уракан Лас-Эрас» сначала болеют за Карлиту, а потом — за Луиса в схватке с шаманом. В итоге Карлита и становится королевой.",
        real:"Департамент к северу от столицы, названный в честь генерала Хуана Грегорио де Лас-Эраса, героя Андской армии. Здесь — Историческое поле Эль-Плумерильо, холмы Эль-Чальяо и начало дороги в высокие горы."},
      {id:"challao", ll:P.challao, k:"hist", n:"Святилище Эль-Чальяо", ch:[41],
        nov:"Ночью Мария Сильвана Рока входит в старый собор Эль-Чальяо. У алтаря её ждут шаман Лаутаро и юный воин Анту — с бутылкой зелёного стекла, полной золотой медовухи, найденной в руинах Качеуты.",
        real:"Святилище Девы Лурдской на холмах Эль-Чальяо, на окраине Лас-Эраса. Место массовых паломничеств: люди поднимаются сюда пешком по «Крестному пути», а сверху видно всю Мендосу."},
      {id:"fader", ll:P.fader, k:"vino", n:"Музей Фадера (Майор-Драммонд)", ch:[4,6,38,53], img:"novels/tajna-semi-fader/img/04.jpg",
        nov:"В зале музея двое мужчин тайно меняются портфелями. Для Луиса это место особенное и неприятное: в пятнадцать лет он участвовал здесь в конкурсе живописи. В финале Карл объявляет, что музей Фадера теперь принадлежит Серхио.",
        real:"Особняк семьи Фадер в Лухан-де-Куйо, стены которого расписал фресками художник Фернандо Фадер. Сегодня это Провинциальный музей изящных искусств имени Эмилиано Гиньясу — «Дом Фадера» — с садом и коллекцией аргентинской живописи."},
      {id:"lujan", ll:P.lujan, k:"vino", n:"Лухан-де-Куйо", ch:[11,17,47,52],
        nov:"Над виноградниками Лухан-де-Куйо, как феодальный замок, высится особняк таинственного человека в чёрном. Моника и Серхио ездят сюда в центр за покупками, а на Вендимии вице-королевой становится Мария Волощина из Лухан-де-Куйо.",
        real:"«Первая зона» аргентинского виноделия и родина мендосского мальбека: десятки винодельни у подножия Анд. Лухан-де-Куйо стал первым в Аргентине винодельческим регионом с контролируемым наименованием происхождения."},
      {id:"finca", ll:P.finca, k:"vino", n:"Финка Фадер (вымышленная)", ch:[12,17,18,19,21,28,33,36,55],
        nov:"Сердце романа. Портфель застревает между камнями в канале виноградника, медовуха смешивается с водой — и виноград начинает светиться. Здесь Луис и Наталья рисуют Анды, здесь появляется лис, который кусает Адольфо, и здесь Карл Фадер даёт интервью с мате в одной руке и мальбеком в другой.",
        real:"Финки Фадер на самом деле нет, но она похожа на десятки семейных финок Лухан-де-Куйо: дом с террасой, ряды лоз, арык и вид на снежные Анды. Сбор винограда — с февраля по апрель."},
      {id:"cacheuta", ll:P.cacheuta, k:"mont", n:"Руины ГЭС в Качеуте", ch:[14,20,21,22,27,36,41],
        nov:"Бетонный скелет первой гидроэлектростанции Аргентины, которую строил инженер Карлос Фадер. Здесь мапуче ищут тайник, здесь находят тела двух жандармов, а Анту среди руин отыскивает медовуху — Карл когда-то закопал её под фундаментом станции.",
        real:"Качеута знаменита горячими источниками у реки Мендоса. Был здесь и большой термальный отель, и ГЭС, но в январе 1934 года катастрофический сель с гор разрушил почти всё. Сегодня здесь работают термальные бассейны."},
      {id:"potr", ll:P.potr, k:"mont", n:"Потрерильос", ch:[14,22],
        nov:"Доминго Кастро, «Ягуар», ведёт свой «Форд F-150» по извилистой дороге на Потрерильос: слева — серебряные изгибы реки Мендоса среди красных скал. Потом по этой трассе к руинам Качеуты идёт целая колонна машин.",
        real:"Посёлок у плотины и водохранилища на реке Мендоса, построенных в начале 2000-х. Бирюзовое озеро в горах — место для каяков, рафтинга и виндсёрфинга; мимо проходит дорога в Чили."},
      {id:"inca", ll:P.inca, k:"mont", n:"Пуэнте-дель-Инка", ch:[56],
        nov:"«Последний кусок зеркала был у Пуэнте-дель-Инка», — рассказывает Хулиета в финальном интервью. Лис сказал: если собрать зеркало, мир встанет на место.",
        real:"Природный каменный мост над рекой Лас-Куэвас высоко в Андах, окрашенный в жёлто-оранжевые цвета минеральными горячими источниками. Рядом — вход в парк Аконкагуа."},
      {id:"acon", ll:P.acon, k:"mont", n:"Аконкагуа", ch:[5], far:true,
        nov:"Анды встречают Наталью ещё в аэропорту: снежные вершины на горизонте, и среди них — самая высокая.",
        real:"Самая высокая гора Америки и всего мира за пределами Азии — 6961 метр. Находится в провинции Мендоса, в одноимённом провинциальном парке; каждый год сюда приезжают альпинисты со всего света."}
    ]
  },
  "dikij-chas-2": {
    title:"Мендоса «Духов гор»",
    intro:"Все места Мендосы, через которые проходят Луис и Наташа. Нажми на точку: увидишь, что там случилось в романе и чем это место знаменито на самом деле. Цвет точки — тип места.",
    places:[
      {id:"aero", ll:P.aero, k:"city", n:"Аэропорт Эль-Плумерильо", ch:[8],
        nov:"Самолёт мягко садится, дверь открывается — и сухой тёплый воздух Мендосы обнимает Луиса и Наташу. Свет здесь другой: ярче, почти золотой, «будто солнце решило быть ближе к земле».",
        real:"Международный аэропорт Мендосы. Своё имя он взял у соседнего Исторического поля Эль-Плумерильо: там в 1816–1817 годах генерал Сан-Мартин готовил Андскую армию к переходу через горы."},
      {id:"plaza", ll:P.plaza, k:"city", n:"Пласа Индепенденсия", ch:[9],
        nov:"Первая вечерняя прогулка: фонтаны переливаются огнями, воздух пахнет пылью, листьями и виноградной кожурой — «так пахнут города, где солнце работает больше людей». А рядом, на улице Гарибальди, Наташа тут же находит книжный.",
        real:"Главная площадь Мендосы. Новый город строили вокруг неё после землетрясения 1861 года; по углам — четыре площади-спутницы: Испании, Италии, Чили и Сан-Мартина. Под площадью — Музей современного искусства, по выходным — ярмарка ремесленников."},
      {id:"km0", ll:P.km0, k:"city", n:"Нулевой километр", ch:[20,43,49,55],
        nov:"Ночь праздника: на Нулевом километре Наташа говорит растерянной девушке «Я буду вместо тебя» — и становится королевой Лас-Эраса. Отсюда начинается «Виа Бланка», здесь же происходит дуэль с шаманом Карлосом и Джеком, а в финале — «Нулевой километр II».",
        real:"Точка отсчёта дорог провинции на проспекте Сан-Мартин, в самом центре. Отсюда во время Вендимии проходит «Виа Бланка» — ночное шествие королев на светящихся платформах."},
      {id:"patr", ll:P.patr, k:"hist", n:"Улица Патрисиас Мендосинас", ch:[23],
        nov:"Город перестаёт быть мирным: на улице Патрисиас Мендосинас стоят военные и перекрывают движение. Луис и Наташа мчатся к Ирине.",
        real:"Улица названа в честь «мендосских патрицианок» — женщин, которые в 1816 году отдали свои драгоценности на снаряжение Андской армии Сан-Мартина."},
      {id:"espana", ll:P.espana, k:"city", n:"Площадь Испании", ch:[28,34],
        nov:"Ремесленные киоски, запах дерева и краски — и огненная речь: «Мендосинцы! Я — будущая королева Вендимии! Я Наташа Первая, представительница департамента Лас-Эрас!» Здесь же спрятан последний знак — керамическая плитка с уникальным узором.",
        real:"Самая нарядная из площадей-спутниц: скамейки, фонтан и стены, выложенные бело-синими испанскими изразцами с картинами из истории Мендосы и Испании."},
      {id:"gob", ll:P.gob, k:"hist", n:"Дом правительства", ch:[37,38],
        nov:"Стена града движется на Мендосу. Настя поднимает руки — и вокруг Дома правительства вспыхивает полупрозрачный световой купол. Ледяные камни разбиваются о него. Вечером здесь же Ирина даёт телевизионное интервью: «Я — будущая королева Вендимии».",
        real:"Резиденция губернатора в Гражданском квартале. Град — настоящая беда Мендосы: летние бури за минуты губят урожай, поэтому виноградники накрывают противоградовыми сетками."},
      {id:"parque", ll:P.fuente, k:"park", n:"Парк Сан-Мартина, Фонтан Континентов", ch:[28,33],
        nov:"Полдень, аллеи, у фонтана — сцена, где рэпер поёт по-испански с русским акцентом. Пока люди смотрят на него, Луис ищет среди скульптур фонтана каменный элемент с символами четырёх сторон света.",
        real:"Парк, спроектированный в 1896 году Карлосом Тэйсом: десятки тысяч деревьев посреди пустыни, озеро, розарий, Холм Славы с памятником Андской армии. Фонтан Континентов — один из самых фотографируемых уголков парка."},
      {id:"uncuyo", ll:P.uncuyo, k:"hist", n:"Университет Куйо, факультет политических наук", ch:[27,28,29],
        nov:"«Следующая остановка — университет». Луис ведёт Наташу в свой факультет: в библиотеке в единственном экземпляре «Вскрытых вен Латинской Америки» Эдуардо Галеано спрятано заклинание на языке уарпе — «Только вера в нашу землю сохранит нас».",
        real:"Национальный университет Куйо — главный университет Мендосы, основан в 1939 году. Его кампус стоит рядом с парком Сан-Мартина."},
      {id:"fader", ll:P.fader, k:"vino", n:"Музей Эмилиано Гиньясу (Дом Фадера)", ch:[28,31],
        nov:"На «гордини» через зелёные районы — к музею Фернандо Фадера. Нужно найти картину со спрятанным символом: он появляется только под определённым углом. Луис знает это место слишком хорошо.",
        real:"Особняк семьи Фадер в Майор-Драммонде (Лухан-де-Куйо), который художник Фернандо Фадер расписал фресками. Сегодня — Провинциальный музей изящных искусств имени Эмилиано Гиньясу."},
      {id:"lujan", ll:P.lujan, k:"vino", n:"Лухан-де-Куйо", ch:[12,13,15],
        nov:"Город отступает, начинается простор: дорога ведёт туда, «где земля дышит иначе». Здесь Луис знакомит Наташу с Серхио и Моникой («Да, пап. Она ведьма. Но из хороших»), а потом они несутся на мотоцикле между виноградниками.",
        real:"«Первая зона» аргентинского вина и родина мендосского мальбека: десятки виноделен у подножия Анд. Первый в Аргентине регион с контролируемым наименованием происхождения вина."},
      {id:"heras", ll:P.heras, k:"city", n:"Лас-Эрас", ch:[20,34,45,52,53,55],
        nov:"Наташа — королева Лас-Эраса. Сюда героям приходится отступить, здесь Змай освобождает пять кондоров, и отсюда колонны Лас-Эраса на старых «Растроэхерос» входят в Мендосу освобождать город.",
        real:"Департамент к северу от столицы, названный в честь генерала Хуана Грегорио де Лас-Эраса, героя Андской армии. Отсюда начинается дорога в высокие Анды и в Чили."},
      {id:"plum", ll:P.plum, k:"hist", n:"Историческое поле Эль-Плумерильо", ch:[50],
        nov:"«Мы потеряли центр, а ты приводишь нас на историческое поле», — злится Ирина. «Мы в Лас-Эрасе. И это не случайно», — отвечает Луис. Отсюда начинается контрнаступление.",
        real:"Здесь в 1816–1817 годах генерал Хосе де Сан-Мартин тренировал Андскую армию, которая потом перешла через Анды и освободила Чили. Сегодня — исторический музей под открытым небом."},
      {id:"challao", ll:P.challao, k:"mont", n:"Холмы Эль-Чальяо", ch:[36,37],
        nov:"Сумерки, горячий плотный воздух. Шаман Карлос стоит босиком на каменистой возвышенности: «Здесь граница тонка». Ветер ждёт приказа — и с холмов на город идут буря и град.",
        real:"Предгорья на окраине Лас-Эраса со святилищем Девы Лурдской: сюда приходят паломники, а сверху видна вся Мендоса."},
      {id:"potr", ll:P.potr, k:"mont", n:"Потрерильос", ch:[24,27,28],
        nov:"Дорога вьётся между фиолетовыми склонами, к вечеру озеро отражает розовеющее небо. Среди скал Луис и Наташа находят первый элемент — тёмный камень с металлическим блеском, тёплый на ощупь.",
        real:"Плотина и бирюзовое водохранилище на реке Мендоса, построенные в начале 2000-х. Каяки, рафтинг, виндсёрфинг и дорога в Чили."},
      {id:"tupu", ll:P.tupu, k:"mont", n:"Вулкан Тупунгато", ch:[44,54], far:true,
        nov:"Ночью Луис читает о Тупунгато, а в финале оживают силуэты Аконкагуа, Тупунгато и Майпо: «Пусть боги гор несут вас», — говорит Ольгина на языке уарпе, и духи гор спускаются облаками.",
        real:"Потухший вулкан высотой около 6570 метров на границе Аргентины и Чили. Его имя носит департамент и знаменитая винодельческая зона Валье-де-Уко."},
      {id:"acon", ll:P.acon, k:"mont", n:"Аконкагуа", ch:[10,44,54], far:true,
        nov:"«Кто-то пытается призвать дух Аконкагуа. Не легенду… а нечто реальное», — говорит Марина. Главная гора романа: её дух и решает финал.",
        real:"Самая высокая гора Америки и мира за пределами Азии — 6961 метр, в провинции Мендоса. Каждый год сюда приезжают альпинисты со всего света."}
    ]
  }
};

const LAT0 = -32.8895, LON0 = -68.8458, CX = 640;
let CY = 470, KS = 86;
function proj(ll){
  const dx = (ll[1] - LON0) * 111.32 * Math.cos(LAT0 * Math.PI / 180), dy = (ll[0] - LAT0) * 110.57, r = Math.hypot(dx, dy);
  if (r < 1e-6) return [CX, CY];
  const R = KS * Math.log(1 + r / 0.6); return [CX + dx / r * R, CY - dy / r * R];
}
const path = (a, close) => { const Q = a.map(proj); let d = `M${Q[0][0].toFixed(1)},${Q[0][1].toFixed(1)}`;
  for (let i = 1; i < Q.length - 1; i++) { const mx = (Q[i][0] + Q[i + 1][0]) / 2, my = (Q[i][1] + Q[i + 1][1]) / 2; d += ` Q${Q[i][0].toFixed(1)},${Q[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`; }
  const L = Q[Q.length - 1]; return d + ` L${L[0].toFixed(1)},${L[1].toFixed(1)}` + (close ? " Z" : ""); };
const RIVER = [[-32.86,-69.40],[-32.93,-69.27],[-32.958,-69.20],[-32.99,-69.15],[-33.017,-69.115],[-33.03,-69.03],[-33.045,-68.95],[-33.045,-68.88],[-33.02,-68.80],[-32.97,-68.73],[-32.90,-68.68],[-32.80,-68.61],[-32.70,-68.57]];
const RN7 = [[-32.8895,-68.8458],[-32.95,-68.87],[-33.00,-68.92],[-33.017,-69.11],[-32.958,-69.19],[-32.80,-69.27],[-32.59,-69.35],[-32.70,-69.60],[-32.825,-69.91]];
const OASIS = [[-32.80,-68.80],[-32.82,-68.74],[-32.88,-68.72],[-32.97,-68.74],[-33.06,-68.80],[-33.08,-68.90],[-33.02,-68.94],[-32.95,-68.90],[-32.88,-68.89],[-32.84,-68.88]];
const PEAKS = [[-32.80,-68.98,26],[-32.88,-68.99,30],[-32.96,-69.02,28],[-33.06,-69.06,26],[-32.75,-69.06,24],[-33.10,-69.20,30],[-32.87,-69.12,32],[-32.70,-69.20,30],[-33.20,-69.40,36],[-32.62,-69.50,34],[-33.00,-69.45,38],[-32.75,-69.70,38],[-33.30,-69.55,36],[-32.95,-69.80,40],[-32.55,-69.85,38],[-33.15,-69.95,40],[-32.45,-70.05,36],[-33.45,-69.95,36],[-32.80,-70.15,40]];

function svg(D){
  const U = ui(D).L;
  const T = (ll, t, dx, dy, sz, an) => { const [x, y] = proj(ll); return `<text x="${(x + (dx || 0)).toFixed(0)}" y="${(y + (dy || 0)).toFixed(0)}" text-anchor="${an || "start"}" font-family="Marck Script, cursive" font-size="${sz || 24}" fill="#5a3c1c">${t}</text>`; };
  const peak = (ll, h, snow) => { const [x, y] = proj(ll); return `<path d="M${(x - h).toFixed(0)},${(y + h * .55).toFixed(0)} L${x.toFixed(0)},${(y - h * .75).toFixed(0)} L${(x + h).toFixed(0)},${(y + h * .55).toFixed(0)}" fill="#b9a98d" stroke="#5a4a36" stroke-width="2"/>${snow ? `<path d="M${(x - h * .32).toFixed(0)},${(y - h * .3).toFixed(0)} L${x.toFixed(0)},${(y - h * .75).toFixed(0)} L${(x + h * .32).toFixed(0)},${(y - h * .3).toFixed(0)} L${(x + h * .12).toFixed(0)},${(y - h * .2).toFixed(0)} L${x.toFixed(0)},${(y - h * .34).toFixed(0)} L${(x - h * .14).toFixed(0)},${(y - h * .18).toFixed(0)} Z" fill="#fbf7ee" stroke="none"/>` : ""}<path d="M${x.toFixed(0)},${(y - h * .75).toFixed(0)} L${(x + h * .3).toFixed(0)},${(y + h * .55).toFixed(0)}" stroke="#5a4a36" stroke-width="1" opacity=".5"/>`; };
  const [ax, ay] = proj(P.acon), [tx, ty] = proj(P.tupu), [px, py] = proj(P.potr);
  const pins = D.places.map((p, i) => { const [x, y] = proj(p.ll), c = KIND[p.k].c;
    return `<g class="mz-pin" data-p="${p.id}" tabindex="0" role="button" aria-label="${esc(p.n)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <circle class="halo" r="24" fill="${c}" opacity=".18"/><circle class="seal" r="15" fill="${c}" stroke="#fff" stroke-width="2.5"/><text text-anchor="middle" dy="5">${i + 1}</text></g>`; }).join("");
  return `<svg viewBox="0 0 1000 1000" role="img" aria-label="${esc(D.title)}">
  <defs><filter id="mzR"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
  <radialGradient id="mzVig" cx="55%" cy="50%" r="72%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#5a3510" stop-opacity=".35"/></radialGradient>
  <pattern id="mzVine" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><circle cx="4" cy="4" r="2" fill="#5d7f35" opacity=".45"/><circle cx="11" cy="11" r="2" fill="#5d7f35" opacity=".45"/></pattern></defs>
  <rect width="1000" height="1000" fill="#efe0bd"/>
  <path d="${path(OASIS, true)}" fill="#cfd8a3" opacity=".75" filter="url(#mzR)"/><path d="${path(OASIS, true)}" fill="url(#mzVine)" filter="url(#mzR)"/>
  <g filter="url(#mzR)">${PEAKS.slice().sort((a, b) => proj([a[0], a[1]])[1] - proj([b[0], b[1]])[1]).map(p => peak([p[0], p[1]], p[2], p[2] > 31)).join("")}
    ${peak(P.tupu, 46, true)}${peak(P.acon, 58, true)}
    <path d="${path(RIVER)}" fill="none" stroke="#7d9db0" stroke-width="10" opacity=".7" stroke-linecap="round"/><path d="${path(RIVER)}" fill="none" stroke="#3f6178" stroke-width="1.6" opacity=".7"/>
    <ellipse cx="${px.toFixed(0)}" cy="${(py + 6).toFixed(0)}" rx="26" ry="11" fill="#5fb8b0" stroke="#3f6178" stroke-width="1.5"/>
    <path d="${path(RN7)}" fill="none" stroke="#8a5a1e" stroke-width="2.5" stroke-dasharray="8 6" opacity=".7"/>
    ${D.wide ? (() => { const [gx, gy] = proj(P.guana);
      return [[-34.20,-69.85,34],[-34.70,-70.05,36],[-35.15,-70.10,38],[-35.60,-69.95,34],[-33.80,-69.70,34],[-36.00,-69.30,30],[-35.85,-69.15,26]].map(q => peak([q[0], q[1]], q[2], q[2] > 31)).join("")
        + `<ellipse cx="${gx.toFixed(0)}" cy="${gy.toFixed(0)}" rx="40" ry="16" fill="#a9c9cf" stroke="#3f6178" stroke-width="1.5" stroke-dasharray="5 4"/>`
        + `<path d="${path([[-33.05,-68.88],[-33.60,-68.70],[-34.20,-68.55],[-34.62,-68.33],[-35.00,-68.10]])}" fill="none" stroke="#8a5a1e" stroke-width="2.5" stroke-dasharray="8 6" opacity=".6"/>`; })() : ""}
  </g>
  <circle cx="${CX}" cy="${CY}" r="78" fill="none" stroke="#8a5a1e" stroke-width="1.5" stroke-dasharray="3 6" opacity=".6"/>
  ${T([-32.8895,-68.8458], U.city, 0, -88, 30, "middle")}
  ${T(P.acon, U.acon, 0, -100, 22, "middle")}${T(P.tupu, U.tupu, 0, 56, 22, "middle")}
  ${T([-32.97,-68.73], U.river, 14, 30, 20)}${T(P.lujan, U.lujan, 20, 34, 20)}${T(P.heras, U.heras, -40, -30, 20)}
  ${T(P.godoy, U.godoy, 22, 10, 18)}<text x="70" y="520" transform="rotate(-90 70 520)" text-anchor="middle" font-family="Marck Script, cursive" font-size="40" fill="#5a3c1c" opacity=".8">${U.andes}</text>${T(P.cacheuta, U.cach, 0, 34, 19, "middle")}${T(P.potr, U.potr, 0, -26, 19, "middle")}
  ${T([-32.62,-69.33], U.chile, 34, 0, 17, "start")}
  ${D.wide ? T(P.guana, D.lang === "cs" ? "laguny Guanacache" : "lagunas de Guanacache", 0, 40, 18, "middle") + T([-34.61,-68.33], "San Rafael", 12, 6, 18) + T(P.malar, "Malargüe", 0, 44, 20, "middle") + T(P.uco, D.lang === "cs" ? "údolí Uco" : "Valle de Uco", 22, 28, 18) : ""}
  <g transform="translate(925 905)" font-family="Marck Script, cursive" fill="#5a3c1c"><circle r="34" fill="none" stroke="#5a3c1c" stroke-width="2"/><path d="M0,-30 L7,0 L0,30 L-7,0 Z" fill="#7a2e5a" opacity=".8"/><text y="-40" text-anchor="middle" font-size="22">${U.n}</text></g>
  <text x="40" y="930" font-family="Marck Script, cursive" font-size="40" fill="#3b2611">${esc(D.title)}</text>
  <text x="42" y="962" font-family="Marck Script, cursive" font-size="20" fill="#6d5232">${U.sub}</text>
  <g class="pins">${pins}</g><rect width="1000" height="1000" fill="url(#mzVig)" pointer-events="none"/></svg>`;
}

function css(){
  if (document.getElementById("mzCss")) return;
  if (!document.getElementById("anFonts")) { const l = document.createElement("link"); l.id = "anFonts"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Marck+Script&family=Bad+Script&family=Caveat:wght@500;700&family=Neucha&display=swap"; document.head.appendChild(l); }
  const s = document.createElement("style"); s.id = "mzCss";
  s.textContent = `
.mz h3{font:400 22px var(--serif);color:var(--ink);margin:2px 0 8px}.mz .mz-p{font:14px/1.55 var(--sans);color:var(--muted);margin:0 0 12px}
.mz-map{position:relative;border-radius:10px;overflow:hidden;box-shadow:0 2px 14px rgba(60,35,10,.25)}.mz-map svg{display:block;width:100%;height:auto}
.mz-pin{cursor:pointer;outline:none}.mz-pin text{font:700 14px Inter,sans-serif;fill:#fff;pointer-events:none}.mz-pin .seal{transition:r .15s}.mz-pin:hover .seal,.mz-pin.on .seal{r:19}
.mz-pin.on .halo{animation:mzPulse 1.4s ease-in-out infinite}@keyframes mzPulse{50%{r:32;opacity:.35}}.mz-pin.dim{opacity:.15;pointer-events:none}.mz-pin:focus-visible .seal{stroke:#ffcf3f;stroke-width:4}
.mz-kinds{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.mz-kinds button{font:600 12px var(--sans);border:2px solid var(--c);color:var(--ink);background:transparent;border-radius:999px;padding:5px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.mz-kinds button i{width:9px;height:9px;border-radius:50%;background:var(--c)}.mz-kinds button.on{background:var(--c);color:#fff}.mz-kinds button.on i{background:#fff}
.mz-tools{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.mz-btn{font:600 13px var(--sans);border:0;border-radius:999px;padding:9px 16px;background:var(--bg);color:var(--ink);cursor:pointer}
.mz-card{background:var(--bg);border-radius:14px;padding:14px;margin:10px 0}.mz-card img{width:100%;max-height:260px;object-fit:cover;border-radius:10px;margin:0 0 10px}
.mz-card h4{font:400 22px var(--serif);margin:0 0 2px;color:var(--ink)}.mz-card .kd{font:600 12px var(--sans);color:#fff;border-radius:999px;padding:3px 9px;display:inline-block;margin:2px 0 8px}
.mz-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.mz-two section{background:var(--paper);border-radius:12px;padding:10px 12px}.mz-two b{display:block;font:700 12px var(--sans);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 4px}
.mz-two p{font:14.5px/1.55 var(--sans);margin:0;color:var(--ink)}.mz-card .chs{font:600 13px var(--sans);margin:10px 0 0}.mz-card .chs a{color:var(--accent);text-decoration:none}
.mz-list{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:2px 14px}.mz-list button{all:unset;cursor:pointer;display:flex;gap:8px;align-items:baseline;font:14px/1.35 var(--sans);padding:4px 0;color:var(--ink)}
.mz-list b{min-width:22px;height:22px;border-radius:50%;color:#fff;font:700 11px/22px Inter,sans-serif;text-align:center;flex:none}.mz-list button:hover span{color:var(--accent)}
@media (max-width:600px){.mz-two,.mz-list{grid-template-columns:1fr}}`;
  document.head.appendChild(s);
}

function map(el, o){
  css(); const D = DATA[o.slug]; if (!D) { el.innerHTML = ""; return; } const U = ui(D); KS = D.ks || 86; CY = D.cy || 470;
  let kind = null, sel = null, zoom = false;
  el.innerHTML = `<div class="mz"><h3>${esc(D.title)}</h3><p class="mz-p">${esc(D.intro)}</p>
    <div class="mz-kinds">${Object.entries(KIND).filter(([k]) => D.places.some(p => p.k === k)).map(([k, v]) => `<button type="button" data-k="${k}" style="--c:${v.c}"><i></i>${esc(kt(D, k))}</button>`).join("")}</div>
    <div class="mz-map">${svg(D)}</div>
    <div class="mz-tools"><button type="button" class="mz-btn" data-zoom>${esc(U.zoomIn)}</button><button type="button" class="mz-btn" data-all>${esc(U.all)}</button></div>
    <div class="mz-box"></div>
    <ol class="mz-list">${D.places.map((p, i) => `<li><button type="button" data-l="${p.id}"><b style="background:${KIND[p.k].c}">${i + 1}</b><span>${esc(p.n)}</span></button></li>`).join("")}</ol></div>`;
  const sv = el.querySelector("svg"), box = el.querySelector(".mz-box");
  const apply = () => {
    el.querySelectorAll("[data-k]").forEach(b => b.classList.toggle("on", b.dataset.k === kind));
    el.querySelectorAll(".mz-pin").forEach(g => { const p = D.places.find(x => x.id === g.dataset.p); g.classList.toggle("dim", !!kind && p.k !== kind); g.classList.toggle("on", g.dataset.p === sel); });
  };
  const show = id => {
    sel = id; apply(); const p = D.places.find(x => x.id === id), i = D.places.indexOf(p) + 1, K = KIND[p.k];
    box.innerHTML = `<div class="mz-card">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : ""}<h4>${i}. ${esc(p.n)}</h4><span class="kd" style="background:${K.c}">${esc(kt(D, p.k))}</span>
      <div class="mz-two"><section><b>${esc(U.nov)}</b><p>${esc(p.nov)}</p></section><section><b>${esc(U.real)}</b><p>${esc(p.real)}</p></section></div>
      <p class="chs">${p.ch.map(c => `<a href="#/${o.slug}/${c}">${esc(U.ch)} ${c}</a>`).join(" · ")}</p></div>`;
    box.scrollIntoView({block:"nearest", behavior:"smooth"});
  };
  el.querySelectorAll(".mz-pin").forEach(g => { g.onclick = () => show(g.dataset.p); g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(g.dataset.p); } }; });
  el.querySelectorAll("[data-l]").forEach(b => b.onclick = () => show(b.dataset.l));
  el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { kind = kind === b.dataset.k ? null : b.dataset.k; apply(); });
  el.querySelector("[data-all]").onclick = () => { kind = null; apply(); };
  el.querySelector("[data-zoom]").onclick = e => { zoom = !zoom; sv.setAttribute("viewBox", zoom ? `${CX - 230} ${CY - 230} 460 460` : "0 0 1000 1000"); e.currentTarget.textContent = zoom ? U.zoomOut : U.zoomIn; };
}

window.LitmirMendoza = {map};
})();
