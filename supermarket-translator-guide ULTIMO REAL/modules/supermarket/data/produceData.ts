
export const produceData: Record<string, { source_term: string; image: string; gender_pt: 'm' | 'f'; translations: Record<string, string>; phonetics?: Record<string, string> }[]> = {
  fruits: [
      { 
        source_term: "Maçã", image: "", gender_pt: "f", 
        translations: { cl: "Manzana", ar: "Manzana", gb: "Apple", us: "Apple", pt: "Maçã", es: "Manzana", fr: "Pomme", it: "Mela" }, 
        phonetics: { us: "/ˈæp.əl/", gb: "/ˈæp.əl/", br: "/maˈsɐ̃/", pt: "/mɐˈsɐ̃/", es: "/manˈθana/", cl: "/manˈsana/", ar: "/manˈsana/", fr: "/pɔm/", it: "/ˈmɛ.la/" } 
      },
      { 
        source_term: "Banana", image: "", gender_pt: "f", 
        translations: { cl: "Plátano", ar: "Banana", gb: "Banana", us: "Banana", pt: "Banana", es: "Plátano", fr: "Banane", it: "Banana" }, 
        phonetics: { us: "/bəˈnæn.ə/", gb: "/bəˈnɑː.nə/", br: "/baˈnɐ.nɐ/", pt: "/bɐˈnɐ.nɐ/", es: "/ˈplatano/", cl: "/ˈplatano/", ar: "/baˈnana/", fr: "/ba.nan/", it: "/baˈna.na/" } 
      },
      { 
        source_term: "Laranja", image: "", gender_pt: "f", 
        translations: { cl: "Naranja", ar: "Naranja", gb: "Orange", us: "Orange", pt: "Laranja", es: "Naranja", fr: "Orange", it: "Arancia" }, 
        phonetics: { us: "/ˈɔːr.ɪndʒ/", gb: "/ˈɒr.ɪndʒ/", br: "/laˈɾɐ̃.ʒɐ/", pt: "/lɐˈɾɐ̃.ʒɐ/", es: "/naˈɾaŋxa/", cl: "/naˈɾaŋxa/", ar: "/naˈɾaŋxa/", fr: "/ɔ.ʁɑ̃ʒ/", it: "/aˈran.tʃa/" } 
      },
      { 
        source_term: "Uva", image: "", gender_pt: "f", 
        translations: { cl: "Uva", ar: "Uva", gb: "Grape", us: "Grape", pt: "Uva", es: "Uva", fr: "Raisin", it: "Uva" }, 
        phonetics: { us: "/ɡreɪp/", gb: "/ɡreɪp/", br: "/ˈu.vɐ/", pt: "/ˈu.vɐ/", es: "/ˈuβa/", cl: "/ˈuβa/", ar: "/ˈuβa/", fr: "/ʁɛ.zɛ̃/", it: "/ˈu.va/" } 
      },
      { 
        source_term: "Morango", image: "", gender_pt: "m", 
        translations: { cl: "Frutilla", ar: "Frutilla", gb: "Strawberry", us: "Strawberry", pt: "Morango", es: "Fresa", fr: "Fraise", it: "Fragola" }, 
        phonetics: { us: "/ˈstrɔːˌbɛr.i/", gb: "/ˈstrɔː.bər.i/", br: "/moˈɾɐ̃.ɡu/", pt: "/muˈɾɐ̃.ɡu/", es: "/ˈfɾesa/", cl: "/fɾuˈtiʝa/", ar: "/fɾuˈtiʃa/", fr: "/fʁɛz/", it: "/ˈfra.ɡo.la/" } 
      },
      { 
        source_term: "Abacaxi", image: "", gender_pt: "m", 
        translations: { cl: "Piña", ar: "Ananá", gb: "Pineapple", us: "Pineapple", pt: "Ananás", es: "Piña", fr: "Ananas", it: "Ananas" }, 
        phonetics: { us: "/ˈpaɪnˌæp.əl/", gb: "/ˈpaɪnˌæp.əl/", br: "/a.ba.kaˈʃi/", pt: "/ɐ.nɐˈnaʃ/", es: "/ˈpiɲa/", cl: "/ˈpiɲa/", ar: "/anaˈna/", fr: "/a.na.nas/", it: "/ˈa.na.nas/" } 
      },
      { 
        source_term: "Manga", image: "", gender_pt: "f", 
        translations: { cl: "Mango", ar: "Mango", gb: "Mango", us: "Mango", pt: "Manga", es: "Mango", fr: "Mangue", it: "Mango" }, 
        phonetics: { us: "/ˈmæŋ.ɡoʊ/", gb: "/ˈmæŋ.ɡəʊ/", br: "/ˈmɐ̃.ɡɐ/", pt: "/ˈmɐ̃.ɡɐ/", es: "/ˈmanɡo/", cl: "/ˈmanɡo/", ar: "/ˈmanɡo/", fr: "/mɑ̃ɡ/", it: "/ˈman.ɡo/" } 
      },
      { 
        source_term: "Limão", image: "", gender_pt: "m", 
        translations: { cl: "Limón", ar: "Limón", gb: "Lemon", us: "Lemon", pt: "Limão", es: "Limón", fr: "Citron", it: "Limone" }, 
        phonetics: { us: "/ˈlɛm.ən/", gb: "/ˈlɛm.ən/", br: "/liˈmɐ̃w/", pt: "/liˈmɐ̃w/", es: "/liˈmon/", cl: "/liˈmon/", ar: "/liˈmon/", fr: "/si.tʁɔ̃/", it: "/liˈmo.ne/" } 
      },
      { 
        source_term: "Pêra", image: "", gender_pt: "f", 
        translations: { cl: "Pera", ar: "Pera", gb: "Pear", us: "Pear", pt: "Pera", es: "Pera", fr: "Poire", it: "Pera" }, 
        phonetics: { us: "/pɛər/", gb: "/peər/", br: "/ˈpe.ɾɐ/", pt: "/ˈpe.ɾɐ/", es: "/ˈpeɾa/", cl: "/ˈpeɾa/", ar: "/ˈpeɾa/", fr: "/pwaʁ/", it: "/ˈpe.ra/" } 
      },
      { 
        source_term: "Melancia", image: "", gender_pt: "f", 
        translations: { cl: "Sandía", ar: "Sandía", gb: "Watermelon", us: "Watermelon", pt: "Melancia", es: "Sandía", fr: "Pastèque", it: "Anguria" }, 
        phonetics: { us: "/ˈwɔː.tərˌmɛl.ən/", gb: "/ˈwɔː.təˌmɛl.ən/", br: "/me.lɐ̃ˈsi.ɐ/", pt: "/mɐ.lɐ̃ˈsi.ɐ/", es: "/sanˈdia/", cl: "/sanˈdia/", ar: "/sanˈdia/", fr: "/pas.tɛk/", it: "/anˈɡu.rja/" } 
      },
      { 
        source_term: "Abacate", image: "", gender_pt: "m", 
        translations: { cl: "Palta", ar: "Palta", gb: "Avocado", us: "Avocado", pt: "Abacate", es: "Aguacate", fr: "Avocat", it: "Avocado" }, 
        phonetics: { us: "/ˌæv.əˈkɑː.doʊ/", gb: "/ˌæv.əˈkɑː.dəʊ/", br: "/a.baˈka.tʃi/", pt: "/ɐ.bɐˈka.tɨ/", es: "/aɣwaˈkate/", cl: "/ˈpalta/", ar: "/ˈpalta/", fr: "/a.vɔ.ka/", it: "/avoˈka.do/" } 
      },
      { 
        source_term: "Melão", image: "", gender_pt: "m", 
        translations: { cl: "Melón", ar: "Melón", gb: "Melon", us: "Melon", pt: "Melão", es: "Melón", fr: "Melon", it: "Melone" }, 
        phonetics: { us: "/ˈmɛl.ən/", gb: "/ˈmɛl.ən/", br: "/meˈlɐ̃w/", pt: "/mɨˈlɐ̃w/", es: "/meˈlon/", cl: "/meˈlon/", ar: "/meˈlon/", fr: "/mə.lɔ̃/", it: "/meˈlo.ne/" } 
      },
      { 
        source_term: "Pêssego", image: "", gender_pt: "m", 
        translations: { cl: "Durazno", ar: "Durazno", gb: "Peach", us: "Peach", pt: "Pêssego", es: "Melocotón", fr: "Pêche", it: "Pesca" }, 
        phonetics: { us: "/piːtʃ/", gb: "/piːtʃ/", br: "/ˈpe.se.ɡu/", pt: "/ˈpe.sɨ.ɡu/", es: "/melokoˈton/", cl: "/duˈɾasno/", ar: "/duˈɾasno/", fr: "/pɛʃ/", it: "/ˈpɛs.ka/" } 
      },
      { 
        source_term: "Ameixa", image: "", gender_pt: "f", 
        translations: { cl: "Ciruela", ar: "Ciruela", gb: "Plum", us: "Plum", pt: "Ameixa", es: "Ciruela", fr: "Prune", it: "Prugna" }, 
        phonetics: { us: "/plʌm/", gb: "/plʌm/", br: "/aˈmej.ʃɐ/", pt: "/ɐˈmɐj.ʃɐ/", es: "/θiˈɾwela/", cl: "/siˈɾwela/", ar: "/siˈɾwela/", fr: "/pʁyn/", it: "/ˈpruɲ.ɲa/" } 
      },
      { 
        source_term: "Cereja", image: "", gender_pt: "f", 
        translations: { cl: "Cereza", ar: "Cereza", gb: "Cherry", us: "Cherry", pt: "Cereja", es: "Cereza", fr: "Cerise", it: "Ciliegia" }, 
        phonetics: { us: "/ˈtʃɛr.i/", gb: "/ˈtʃɛr.i/", br: "/seˈɾe.ʒɐ/", pt: "/sɨˈɾɐj.ʒɐ/", es: "/θeˈɾeθa/", cl: "/seˈɾesa/", ar: "/seˈɾesa/", fr: "/sə.ʁiz/", it: "/tʃiˈljɛ.dʒa/" } 
      },
      { 
        source_term: "Kiwi", image: "", gender_pt: "m", 
        translations: { cl: "Kiwi", ar: "Kiwi", gb: "Kiwi", us: "Kiwi", pt: "Kiwi", es: "Kiwi", fr: "Kiwi", it: "Kiwi" }, 
        phonetics: { us: "/ˈkiː.wiː/", gb: "/ˈkiː.wiː/", br: "/kiˈwi/", pt: "/kiˈwi/", es: "/ˈkiwi/", cl: "/ˈkiwi/", ar: "/ˈkiwi/", fr: "/ki.wi/", it: "/ˈki.wi/" } 
      },
      { 
        source_term: "Figo", image: "", gender_pt: "m", 
        translations: { cl: "Higo", ar: "Higo", gb: "Fig", us: "Fig", pt: "Figo", es: "Higo", fr: "Figue", it: "Fico" }, 
        phonetics: { us: "/fɪɡ/", gb: "/fɪɡ/", br: "/ˈfi.ɡu/", pt: "/ˈfi.ɡu/", es: "/ˈiɣo/", cl: "/ˈiɣo/", ar: "/ˈiɣo/", fr: "/fiɡ/", it: "/ˈfi.ko/" } 
      },
      { 
        source_term: "Goiaba", image: "", gender_pt: "f", 
        translations: { cl: "Guayaba", ar: "Guayaba", gb: "Guava", us: "Guava", pt: "Goiaba", es: "Guayaba", fr: "Goyave", it: "Guava" }, 
        phonetics: { us: "/ˈɡwɑː.və/", gb: "/ˈɡwɑː.və/", br: "/ɡojˈja.bɐ/", pt: "/ɡojˈja.bɐ/", es: "/ɡwaˈʝaβa/", cl: "/ɡwaˈʝaβa/", ar: "/ɡwaˈʃaβa/", fr: "/ɡɔ.jav/", it: "/ˈɡwa.va/" } 
      },
      { 
        source_term: "Maracujá", image: "", gender_pt: "m", 
        translations: { cl: "Maracuyá", ar: "Maracuyá", gb: "Passion Fruit", us: "Passion Fruit", pt: "Maracujá", es: "Maracuyá", fr: "Fruit de la passion", it: "Frutto della passione" }, 
        phonetics: { us: "/ˈpæʃ.ən fruːt/", gb: "/ˈpæʃ.ən fruːt/", br: "/ma.ɾa.kuˈʒa/", pt: "/mɐ.ɾɐ.kuˈʒa/", es: "/maɾakuˈʝa/", cl: "/maɾakuˈʝa/", ar: "/maɾakuˈʃa/", fr: "/fʁɥi də la pa.sjɔ̃/", it: "/ˈfrut.to ˈdel.la pasˈsjo.ne/" } 
      },
      { 
        source_term: "Mamão", image: "", gender_pt: "m", 
        translations: { cl: "Papaya", ar: "Mamón", gb: "Papaya", us: "Papaya", pt: "Papaia", es: "Papaya", fr: "Papaye", it: "Papaia" }, 
        phonetics: { us: "/pəˈpaɪ.ə/", gb: "/pəˈpaɪ.ə/", br: "/maˈmɐ̃w/", pt: "/pɐˈpaj.ɐ/", es: "/paˈpaʝa/", cl: "/paˈpaʝa/", ar: "/maˈmon/", fr: "/pa.paj/", it: "/paˈpa.ja/" } 
      },
      { 
        source_term: "Caqui", image: "", gender_pt: "m", 
        translations: { cl: "Caqui", ar: "Caqui", gb: "Persimmon", us: "Persimmon", pt: "Dióspiro", es: "Caqui", fr: "Kaki", it: "Cachi" }, 
        phonetics: { us: "/pərˈsɪm.ən/", gb: "/pəˈsɪm.ən/", br: "/kaˈki/", pt: "/diˈɔʃ.pi.ɾu/", es: "/ˈkaki/", cl: "/ˈkaki/", ar: "/ˈkaki/", fr: "/ka.ki/", it: "/ˈka.ki/" } 
      },
      { 
        source_term: "Framboesa", image: "", gender_pt: "f", 
        translations: { cl: "Frambuesa", ar: "Frambuesa", gb: "Raspberry", us: "Raspberry", pt: "Framboesa", es: "Frambuesa", fr: "Framboise", it: "Lampone" }, 
        phonetics: { us: "/ˈræz.bɛr.i/", gb: "/ˈrɑːz.bər.i/", br: "/fɾɐ̃.buˈe.zɐ/", pt: "/fɾɐ̃.buˈe.zɐ/", es: "/fɾamˈbwesa/", cl: "/fɾamˈbwesa/", ar: "/fɾamˈbwesa/", fr: "/fʁɑ̃.bwaz/", it: "/lamˈpo.ne/" } 
      },
      { 
        source_term: "Mirtilo", image: "", gender_pt: "m", 
        translations: { cl: "Arándano", ar: "Arándano", gb: "Blueberry", us: "Blueberry", pt: "Mirtilo", es: "Arándano", fr: "Myrtille", it: "Mirtillo" }, 
        phonetics: { us: "/ˈbluːˌbɛr.i/", gb: "/ˈbluːˌbər.i/", br: "/miʁˈtʃi.lu/", pt: "/miɾˈti.lu/", es: "/aˈɾandano/", cl: "/aˈɾandano/", ar: "/aˈɾandano/", fr: "/miʁ.tij/", it: "/mirˈtil.lo/" } 
      },
      { 
        source_term: "Amora", image: "", gender_pt: "f", 
        translations: { cl: "Mora", ar: "Mora", gb: "Blackberry", us: "Blackberry", pt: "Amora", es: "Mora", fr: "Mûre", it: "Mora" }, 
        phonetics: { us: "/ˈblækˌbɛr.i/", gb: "/ˈblæk.bər.i/", br: "/aˈmɔ.ɾɐ/", pt: "/ɐˈmɔ.ɾɐ/", es: "/ˈmoɾa/", cl: "/ˈmoɾa/", ar: "/ˈmoɾa/", fr: "/myʁ/", it: "/ˈmɔ.ra/" } 
      },
      { 
        source_term: "Tangerina", image: "", gender_pt: "f", 
        translations: { cl: "Mandarina", ar: "Mandarina", gb: "Tangerine", us: "Tangerine", pt: "Tangerina", es: "Mandarina", fr: "Mandarine", it: "Mandarino" }, 
        phonetics: { us: "/ˈtæn.dʒə.riːn/", gb: "/ˌtæn.dʒəˈriːn/", br: "/tɐ̃.ʒeˈɾi.nɐ/", pt: "/tɐ̃.ʒɨˈɾi.nɐ/", es: "/mandaˈɾina/", cl: "/mandaˈɾina/", ar: "/mandaˈɾina/", fr: "/mɑ̃.da.ʁin/", it: "/man.daˈri.no/" } 
      },
  ],
  greens: [
      { 
        source_term: "Alface", image: "", gender_pt: "f", 
        translations: { cl: "Lechuga", ar: "Lechuga", gb: "Lettuce", us: "Lettuce", pt: "Alface", es: "Lechuga", fr: "Laitue", it: "Lattuga" }, 
        phonetics: { us: "/ˈlɛt.əs/", gb: "/ˈlɛt.ɪs/", br: "/awˈfa.si/", pt: "/alˈfa.sɨ/", es: "/leˈtʃuɣa/", cl: "/leˈtʃuɣa/", ar: "/leˈtʃuɣa/", fr: "/lɛ.ty/", it: "/latˈtu.ɡa/" } 
      },
      { 
        source_term: "Tomate", image: "", gender_pt: "m", 
        translations: { cl: "Tomate", ar: "Tomate", gb: "Tomato", us: "Tomato", pt: "Tomate", es: "Tomate", fr: "Tomate", it: "Pomodoro" }, 
        phonetics: { us: "/təˈmeɪ.toʊ/", gb: "/təˈmɑː.təʊ/", br: "/toˈma.tʃi/", pt: "/tuˈma.tɨ/", es: "/toˈmate/", cl: "/toˈmate/", ar: "/toˈmate/", fr: "/tɔ.mat/", it: "/pomoˈdɔ.ro/" } 
      },
      { 
        source_term: "Cebola", image: "", gender_pt: "f", 
        translations: { cl: "Cebolla", ar: "Cebolla", gb: "Onion", us: "Onion", pt: "Cebola", es: "Cebolla", fr: "Oignon", it: "Cipolla" }, 
        phonetics: { us: "/ˈʌn.jən/", gb: "/ˈʌn.jən/", br: "/seˈbo.lɐ/", pt: "/sɨˈbo.lɐ/", es: "/θeˈβoʎa/", cl: "/seˈβoʝa/", ar: "/seˈβoʃa/", fr: "/ɔ.ɲɔ̃/", it: "/tʃiˈpol.la/" } 
      },
      { 
        source_term: "Cenoura", image: "", gender_pt: "f", 
        translations: { cl: "Zanahoria", ar: "Zanahoria", gb: "Carrot", us: "Carrot", pt: "Cenoura", es: "Zanahoria", fr: "Carotte", it: "Carota" }, 
        phonetics: { us: "/ˈkær.ət/", gb: "/ˈkær.ət/", br: "/seˈnow.ɾɐ/", pt: "/sɨˈno.ɾɐ/", es: "/θanaˈoɾja/", cl: "/sanaˈoɾja/", ar: "/sanaˈoɾja/", fr: "/ka.ʁɔt/", it: "/kaˈrɔ.ta/" } 
      },
      { 
        source_term: "Batata", image: "", gender_pt: "f", 
        translations: { cl: "Papa", ar: "Papa", gb: "Potato", us: "Potato", pt: "Batata", es: "Patata", fr: "Pomme de terre", it: "Patata" }, 
        phonetics: { us: "/pəˈteɪ.toʊ/", gb: "/pəˈteɪ.təʊ/", br: "/baˈta.tɐ/", pt: "/bɐˈta.tɐ/", es: "/paˈtata/", cl: "/ˈpapa/", ar: "/ˈpapa/", fr: "/pɔm də tɛʁ/", it: "/paˈta.ta/" } 
      },
      { 
        source_term: "Espinafre", image: "", gender_pt: "m", 
        translations: { cl: "Espinaca", ar: "Espinaca", gb: "Spinach", us: "Spinach", pt: "Espinafres", es: "Espinaca", fr: "Épinards", it: "Spinaci" }, 
        phonetics: { us: "/ˈspɪn.ɪtʃ/", gb: "/ˈspɪn.ɪtʃ/", br: "/es.piˈna.fɾi/", pt: "/ɨʃ.piˈna.fɾɨʃ/", es: "/espiˈnaka/", cl: "/espiˈnaka/", ar: "/espiˈnaka/", fr: "/e.pi.naʁ/", it: "/spiˈna.tʃi/" } 
      },
      { 
        source_term: "Brócolis", image: "", gender_pt: "m", 
        translations: { cl: "Brócoli", ar: "Brócoli", gb: "Broccoli", us: "Broccoli", pt: "Brócolos", es: "Brócoli", fr: "Brocoli", it: "Broccoli" }, 
        phonetics: { us: "/ˈbrɑː.kəl.i/", gb: "/ˈbrɒk.əl.i/", br: "/ˈbɾɔ.ko.lis/", pt: "/ˈbɾɔ.ku.luʃ/", es: "/ˈbɾokoli/", cl: "/ˈbɾokoli/", ar: "/ˈbɾokoli/", fr: "/bʁɔ.kɔ.li/", it: "/ˈbrɔk.ko.li/" } 
      },
      { 
        source_term: "Repolho", image: "", gender_pt: "m", 
        translations: { cl: "Repollo", ar: "Repollo", gb: "Cabbage", us: "Cabbage", pt: "Couve", es: "Col", fr: "Chou", it: "Cavolo" }, 
        phonetics: { us: "/ˈkæb.ɪdʒ/", gb: "/ˈkæb.ɪdʒ/", br: "/ʁeˈpo.ʎu/", pt: "/ˈko.vɨ/", es: "/kol/", cl: "/reˈpoʝo/", ar: "/reˈpoʃo/", fr: "/ʃu/", it: "/ˈka.vo.lo/" } 
      },
      { 
        source_term: "Acelga", image: "", gender_pt: "f", 
        translations: { cl: "Acelga", ar: "Acelga", gb: "Chard", us: "Chard", pt: "Acelga", es: "Acelga", fr: "Blette", it: "Bietola" }, 
        phonetics: { us: "/tʃɑːrd/", gb: "/tʃɑːd/", br: "/aˈsɛw.ɡɐ/", pt: "/ɐˈsɛl.ɡɐ/", es: "/aˈθelɡa/", cl: "/aˈselɡa/", ar: "/aˈselɡa/", fr: "/blɛt/", it: "/ˈbjɛ.to.la/" } 
      },
      { 
        source_term: "Couve-flor", image: "", gender_pt: "f", 
        translations: { cl: "Coliflor", ar: "Coliflor", gb: "Cauliflower", us: "Cauliflower", pt: "Couve-flor", es: "Coliflor", fr: "Chou-fleur", it: "Cavolfiore" }, 
        phonetics: { us: "/ˈkɔː.lɪˌflaʊ.ər/", gb: "/ˈkɒl.ɪˌflaʊ.ər/", br: "/ˈkow.viˈfloʁ/", pt: "/ˈko.vɨˈfloɾ/", es: "/koliˈfloɾ/", cl: "/koliˈfloɾ/", ar: "/koliˈfloɾ/", fr: "/ʃu.flœʁ/", it: "/kavolˈfjo.re/" } 
      },
      { 
        source_term: "Rúcula", image: "", gender_pt: "f", 
        translations: { cl: "Rúcula", ar: "Rúcula", gb: "Rocket", us: "Arugula", pt: "Rúcula", es: "Rúcula", fr: "Roquette", it: "Rucola" }, 
        phonetics: { us: "/əˈruː.ɡə.lə/", gb: "/ˈrɒk.ɪt/", br: "/ˈʁu.ku.lɐ/", pt: "/ˈʁu.ku.lɐ/", es: "/ˈrukula/", cl: "/ˈrukula/", ar: "/ˈrukula/", fr: "/ʁɔ.kɛt/", it: "/ˈru.ko.la/" } 
      },
      { 
        source_term: "Agrião", image: "", gender_pt: "m", 
        translations: { cl: "Berro", ar: "Berro", gb: "Watercress", us: "Watercress", pt: "Agrião", es: "Berro", fr: "Cresson", it: "Crescione" }, 
        phonetics: { us: "/ˈwɔː.tərˌkrɛs/", gb: "/ˈwɔː.tə.krɛs/", br: "/a.ɡɾiˈɐ̃w/", pt: "/ɐ.ɡɾiˈɐ̃w/", es: "/ˈbero/", cl: "/ˈbero/", ar: "/ˈbero/", fr: "/kʁɛ.sɔ̃/", it: "/kreʃˈʃo.ne/" } 
      },
      { 
        source_term: "Alho-poró", image: "", gender_pt: "m", 
        translations: { cl: "Puerro", ar: "Puerro", gb: "Leek", us: "Leek", pt: "Alho-francês", es: "Puerro", fr: "Poireau", it: "Porro" }, 
        phonetics: { us: "/liːk/", gb: "/liːk/", br: "/ˈa.ʎu poˈɾɔ/", pt: "/ˈa.ʎu fɾɐ̃ˈseʃ/", es: "/ˈpweɾo/", cl: "/ˈpweɾo/", ar: "/ˈpweɾo/", fr: "/pwa.ʁo/", it: "/ˈpɔr.ro/" } 
      },
      { 
        source_term: "Salsão", image: "", gender_pt: "m", 
        translations: { cl: "Apio", ar: "Apio", gb: "Celery", us: "Celery", pt: "Aipo", es: "Apio", fr: "Céleri", it: "Sedano" }, 
        phonetics: { us: "/ˈsɛl.ər.i/", gb: "/ˈsɛl.ər.i/", br: "/sawˈsɐ̃w/", pt: "/ˈaj.pu/", es: "/ˈapjo/", cl: "/ˈapjo/", ar: "/ˈapjo/", fr: "/se.lə.ʁi/", it: "/ˈsɛ.da.no/" } 
      },
      { 
        source_term: "Nabo", image: "", gender_pt: "m", 
        translations: { cl: "Nabo", ar: "Nabo", gb: "Turnip", us: "Turnip", pt: "Nabo", es: "Nabo", fr: "Navet", it: "Rapa" }, 
        phonetics: { us: "/ˈtɜːr.nɪp/", gb: "/ˈtɜː.nɪp/", br: "/ˈna.bu/", pt: "/ˈna.bu/", es: "/ˈnaβo/", cl: "/ˈnaβo/", ar: "/ˈnaβo/", fr: "/na.vɛ/", it: "/ˈra.pa/" } 
      },
      { 
        source_term: "Rabanete", image: "", gender_pt: "m", 
        translations: { cl: "Rábano", ar: "Rabanito", gb: "Radish", us: "Radish", pt: "Rabanete", es: "Rábano", fr: "Radis", it: "Ravanello" }, 
        phonetics: { us: "/ˈræd.ɪʃ/", gb: "/ˈræd.ɪʃ/", br: "/ʁa.baˈne.tʃi/", pt: "/ʁɐ.bɐˈne.tɨ/", es: "/ˈraβano/", cl: "/ˈraβano/", ar: "/raβaˈnito/", fr: "/ʁa.di/", it: "/ravaˈnɛl.lo/" } 
      },
      { 
        source_term: "Escarola", image: "", gender_pt: "f", 
        translations: { cl: "Escarola", ar: "Escarola", gb: "Escarole", us: "Escarole", pt: "Escarola", es: "Escarola", fr: "Scarole", it: "Scarola" }, 
        phonetics: { us: "/ˈɛs.kə.roʊl/", gb: "/ˈɛs.kə.rəʊl/", br: "/is.kaˈɾɔ.lɐ/", pt: "/ɨʃ.kɐˈɾɔ.lɐ/", es: "/eskaˈɾola/", cl: "/eskaˈɾola/", ar: "/eskaˈɾola/", fr: "/ska.ʁɔl/", it: "/skaˈrɔ.la/" } 
      },
      { 
        source_term: "Endívia", image: "", gender_pt: "f", 
        translations: { cl: "Endibia", ar: "Endibia", gb: "Endive", us: "Endive", pt: "Endívia", es: "Endibia", fr: "Endive", it: "Indivia" }, 
        phonetics: { us: "/ˈɛn.daɪv/", gb: "/ˈɛn.daɪv/", br: "/ẽˈdʒi.vjɐ/", pt: "/ẽˈdi.vjɐ/", es: "/enˈdiβja/", cl: "/enˈdiβja/", ar: "/enˈdiβja/", fr: "/ɑ̃.div/", it: "/inˈdi.vja/" } 
      },
      { 
        source_term: "Alcachofra", image: "", gender_pt: "f", 
        translations: { cl: "Alcachofa", ar: "Alcaucil", gb: "Artichoke", us: "Artichoke", pt: "Alcachofra", es: "Alcachofa", fr: "Artichaut", it: "Carciofo" }, 
        phonetics: { us: "/ˈɑːr.tɪ.tʃoʊk/", gb: "/ˈɑː.tɪ.tʃəʊk/", br: "/aw.kaˈʃo.fɾɐ/", pt: "/ɐl.kɐˈʃo.fɾɐ/", es: "/alkatˈtʃofa/", cl: "/alkatˈtʃofa/", ar: "/alkauˈsil/", fr: "/aʁ.ti.ʃo/", it: "/karˈtʃɔ.fo/" } 
      },
      { 
        source_term: "Chicória", image: "", gender_pt: "f", 
        translations: { cl: "Achicoria", ar: "Achicoria", gb: "Chicory", us: "Chicory", pt: "Chicória", es: "Achicoria", fr: "Chicorée", it: "Cicoria" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn.ri/", gb: "/ˈtʃɪk.ər.i/", br: "/ʃiˈkɔ.ɾjɐ/", pt: "/ʃiˈkɔ.ɾjɐ/", es: "/atʃiˈkoɾja/", cl: "/atʃiˈkoɾja/", ar: "/atʃiˈkoɾja/", fr: "/ʃi.kɔ.ʁe/", it: "/tʃiˈkɔ.rja/" } 
      },
      { 
        source_term: "Couve", image: "", gender_pt: "f", 
        translations: { cl: "Kale", ar: "Kale", gb: "Kale", us: "Kale", pt: "Couve", es: "Col rizada", fr: "Chou frisé", it: "Cavolo riccio" }, 
        phonetics: { us: "/keɪl/", gb: "/keɪl/", br: "/ˈkow.vi/", pt: "/ˈko.vɨ/", es: "/kol riˈθaða/", cl: "/keil/", ar: "/keil/", fr: "/ʃu fʁi.ze/", it: "/ˈka.vo.lo ˈrit.tʃo/" } 
      },
      { 
        source_term: "Cebola Roxa", image: "", gender_pt: "f", 
        translations: { cl: "Cebolla morada", ar: "Cebolla morada", gb: "Red Onion", us: "Red Onion", pt: "Cebola roxa", es: "Cebolla morada", fr: "Oignon rouge", it: "Cipolla rossa" }, 
        phonetics: { us: "/rɛd ˈʌn.jən/", gb: "/rɛd ˈʌn.jən/", br: "/seˈbo.lɐ ˈʁo.ʃɐ/", pt: "/sɨˈbo.lɐ ˈʁo.ʃɐ/", es: "/θeˈβoʎa moˈɾaða/", cl: "/seˈβoʝa moˈɾaða/", ar: "/seˈβoʃa moˈɾaða/", fr: "/ɔ.ɲɔ̃ ʁuʒ/", it: "/tʃiˈpol.la ˈros.sa/" } 
      },
      { 
        source_term: "Tomate Cereja", image: "", gender_pt: "m", 
        translations: { cl: "Tomate cherry", ar: "Tomate cherry", gb: "Cherry Tomato", us: "Cherry Tomato", pt: "Tomate cereja", es: "Tomate cherry", fr: "Tomate cerise", it: "Pomodorino" }, 
        phonetics: { us: "/ˈtʃɛr.i təˈmeɪ.toʊ/", gb: "/ˈtʃɛr.i təˈmɑː.təʊ/", br: "/toˈma.tʃi seˈɾe.ʒɐ/", pt: "/tuˈma.tɨ sɨˈɾɐj.ʒɐ/", es: "/toˈmate ˈtʃeri/", cl: "/toˈmate ˈtʃeri/", ar: "/toˈmate ˈtʃeri/", fr: "/tɔ.mat sə.ʁiz/", it: "/pomodoˈri.no/" } 
      },
      { 
        source_term: "Funcho", image: "", gender_pt: "m", 
        translations: { cl: "Hinojo", ar: "Hinojo", gb: "Fennel", us: "Fennel", pt: "Funcho", es: "Hinojo", fr: "Fenouil", it: "Finocchio" }, 
        phonetics: { us: "/ˈfɛn.əl/", gb: "/ˈfɛn.əl/", br: "/ˈfũ.ʃu/", pt: "/ˈfũ.ʃu/", es: "/iˈnoxo/", cl: "/iˈnoxo/", ar: "/iˈnoxo/", fr: "/fə.nuj/", it: "/fiˈnɔk.kjo/" } 
      },
      { 
        source_term: "Couve de Bruxelas", image: "", gender_pt: "f", 
        translations: { cl: "Col de Bruselas", ar: "Repollito de Bruselas", gb: "Brussels Sprouts", us: "Brussels Sprouts", pt: "Couve-de-bruxelas", es: "Col de Bruselas", fr: "Chou de Bruxelles", it: "Cavoletti di Bruxelles" }, 
        phonetics: { us: "/ˈbrʌs.əlz spraʊts/", gb: "/ˈbrʌs.əlz spraʊts/", br: "/ˈkow.vi dʒi bɾuˈʃɛ.lɐs/", pt: "/ˈko.vɨ dɨ bɾuˈʃɛ.lɐʃ/", es: "/kol de βɾuˈselas/", cl: "/kol de βɾuˈselas/", ar: "/repoˈʃito ðe βɾuˈselas/", fr: "/ʃu də bʁy.sɛl/", it: "/kavoˈlet.ti di brusˈsɛl/" } 
      },
  ],
  vegetables: [
      { 
        source_term: "Abobrinha", image: "", gender_pt: "f", 
        translations: { cl: "Zapallo italiano", ar: "Zucchini", gb: "Courgette", us: "Zucchini", pt: "Courgette", es: "Calabacín", fr: "Courgette", it: "Zucchina" }, 
        phonetics: { us: "/zuːˈkiː.ni/", gb: "/kʊəˈʒɛt/", br: "/a.bɔˈbɾĩ.ɲɐ/", pt: "/kuɾˈʒɛ.tɨ/", es: "/kalaβaˈθin/", cl: "/saˈpaʝo itaˈljano/", ar: "/suˈkini/", fr: "/kuʁ.ʒɛt/", it: "/dzukˈki.na/" } 
      },
      { 
        source_term: "Berinjela", image: "", gender_pt: "f", 
        translations: { cl: "Berenjena", ar: "Berenjena", gb: "Aubergine", us: "Eggplant", pt: "Beringela", es: "Berenjena", fr: "Aubergine", it: "Melanzana" }, 
        phonetics: { us: "/ˈɛɡ.plænt/", gb: "/ˈoʊ.bə.ʒiːn/", br: "/be.ɾĩˈʒɛ.lɐ/", pt: "/bɨ.ɾĩˈʒɛ.lɐ/", es: "/beɾeŋˈxena/", cl: "/beɾeŋˈxena/", ar: "/beɾeŋˈxena/", fr: "/o.bɛʁ.ʒin/", it: "/melanˈdza.na/" } 
      },
      { 
        source_term: "Pimentão", image: "", gender_pt: "m", 
        translations: { cl: "Pimentón", ar: "Morrón", gb: "Pepper", us: "Bell Pepper", pt: "Pimento", es: "Pimiento", fr: "Poivron", it: "Peperone" }, 
        phonetics: { us: "/bɛl ˈpɛp.ər/", gb: "/ˈpɛp.ə/", br: "/pi.mẽˈtɐ̃w/", pt: "/piˈmẽ.tu/", es: "/piˈmjento/", cl: "/pimenˈton/", ar: "/moˈron/", fr: "/pwa.vʁɔ̃/", it: "/pepeˈro.ne/" } 
      },
      { 
        source_term: "Pepino", image: "", gender_pt: "m", 
        translations: { cl: "Pepino", ar: "Pepino", gb: "Cucumber", us: "Cucumber", pt: "Pepino", es: "Pepino", fr: "Concombre", it: "Cetriolo" }, 
        phonetics: { us: "/ˈkjuː.kʌm.bər/", gb: "/ˈkjuː.kʌm.bə/", br: "/peˈpi.nu/", pt: "/pɨˈpi.nu/", es: "/peˈpino/", cl: "/peˈpino/", ar: "/peˈpino/", fr: "/kɔ̃.kɔ̃bʁ/", it: "/tʃetriˈɔ.lo/" } 
      },
      { 
        source_term: "Abóbora", image: "", gender_pt: "f", 
        translations: { cl: "Zapallo", ar: "Zapallo", gb: "Pumpkin", us: "Pumpkin", pt: "Abóbora", es: "Calabaza", fr: "Citrouille", it: "Zucca" }, 
        phonetics: { us: "/ˈpʌmp.kɪn/", gb: "/ˈpʌmp.kɪn/", br: "/aˈbɔ.bo.ɾɐ/", pt: "/ɐˈbɔ.bɔ.ɾɐ/", es: "/kalaˈβaθa/", cl: "/saˈpaʝo/", ar: "/saˈpaʃo/", fr: "/si.tʁuj/", it: "/ˈdzuk.ka/" } 
      },
      { 
        source_term: "Beterraba", image: "", gender_pt: "f", 
        translations: { cl: "Betarraga", ar: "Remolacha", gb: "Beetroot", us: "Beet", pt: "Beterraba", es: "Remolacha", fr: "Betterave", it: "Barbabietola" }, 
        phonetics: { us: "/biːt/", gb: "/ˈbiːt.ruːt/", br: "/be.teˈʁa.bɐ/", pt: "/bɨ.tɨˈʁa.bɐ/", es: "/remoˈlatʃa/", cl: "/betaˈrraɣa/", ar: "/remoˈlatʃa/", fr: "/bɛt.ʁav/", it: "/barbaˈbjɛ.to.la/" } 
      },
      { 
        source_term: "Mandioca", image: "", gender_pt: "f", 
        translations: { cl: "Yuca", ar: "Mandioca", gb: "Cassava", us: "Yucca/Cassava", pt: "Mandioca", es: "Yuca", fr: "Manioc", it: "Manioca" }, 
        phonetics: { us: "/ˈjʌk.ə/", gb: "/kəˈsɑː.və/", br: "/mɐ̃.dʒiˈɔ.kɐ/", pt: "/mɐ̃.diˈɔ.kɐ/", es: "/ˈʝuka/", cl: "/ˈʝuka/", ar: "/manˈdioka/", fr: "/ma.njɔk/", it: "/maˈnjɔ.ka/" } 
      },
      { 
        source_term: "Batata-doce", image: "", gender_pt: "f", 
        translations: { cl: "Camote", ar: "Batata", gb: "Sweet Potato", us: "Sweet Potato", pt: "Batata-doce", es: "Boniato", fr: "Patate douce", it: "Patata dolce" }, 
        phonetics: { us: "/swiːt pəˈteɪ.toʊ/", gb: "/swiːt pəˈteɪ.təʊ/", br: "/baˈta.tɐ ˈdo.si/", pt: "/bɐˈta.tɐ ˈdo.sɨ/", es: "/boˈnjato/", cl: "/kaˈmote/", ar: "/baˈtata/", fr: "/pa.tat dus/", it: "/paˈta.ta ˈdol.tʃe/" } 
      },
      { 
        source_term: "Inhame", image: "", gender_pt: "m", 
        translations: { cl: "Ñame", ar: "Ñame", gb: "Yam", us: "Yam", pt: "Inhame", es: "Ñame", fr: "Igname", it: "Igname" }, 
        phonetics: { us: "/jæm/", gb: "/jæm/", br: "/ĩˈɲɐ̃.mi/", pt: "/iˈɲɐ.mɨ/", es: "/ˈɲame/", cl: "/ˈɲame/", ar: "/ˈɲame/", fr: "/i.ɲam/", it: "/iɲˈɲa.me/" } 
      },
      { 
        source_term: "Vagem", image: "", gender_pt: "f", 
        translations: { cl: "Poroto verde", ar: "Chaucha", gb: "Green Bean", us: "Green Bean", pt: "Feijão-verde", es: "Judía verde", fr: "Haricot vert", it: "Fagiolino" }, 
        phonetics: { us: "/ɡriːn biːn/", gb: "/ɡriːn biːn/", br: "/ˈva.ʒẽj/", pt: "/fɐjˈʒɐ̃w ˈveɾ.dɨ/", es: "/xuˈðia ˈβeɾðe/", cl: "/poˈɾoto ˈβeɾðe/", ar: "/ˈtʃautʃa/", fr: "/a.ʁi.ko vɛʁ/", it: "/fadʒoˈli.no/" } 
      },
      { 
        source_term: "Quiabo", image: "", gender_pt: "m", 
        translations: { cl: "Okra", ar: "Okra", gb: "Okra", us: "Okra", pt: "Quiabo", es: "Okra", fr: "Gombo", it: "Okra" }, 
        phonetics: { us: "/ˈoʊ.krə/", gb: "/ˈəʊ.krə/", br: "/kiˈa.bu/", pt: "/kiˈa.bu/", es: "/ˈokɾa/", cl: "/ˈokɾa/", ar: "/ˈokɾa/", fr: "/ɡɔ̃.bo/", it: "/ˈɔ.kra/" } 
      },
      { 
        source_term: "Chuchu", image: "", gender_pt: "m", 
        translations: { cl: "Chayote", ar: "Chayote", gb: "Chayote", us: "Chayote", pt: "Chuchu", es: "Chayote", fr: "Chayote", it: "Chayote" }, 
        phonetics: { us: "/tʃaɪˈoʊ.ti/", gb: "/tʃaɪˈoʊ.ti/", br: "/ʃuˈʃu/", pt: "/ʃuˈʃu/", es: "/tʃaˈʝote/", cl: "/tʃaˈʝote/", ar: "/tʃaˈʃote/", fr: "/ʃa.jɔt/", it: "/tʃaˈjɔ.te/" } 
      },
      { 
        source_term: "Milho Verde", image: "", gender_pt: "m", 
        translations: { cl: "Choclo", ar: "Choclo", gb: "Corn on the cob", us: "Corn on the cob", pt: "Maçaroca", es: "Mazorca de maíz", fr: "Épi de maïs", it: "Pannocchia" }, 
        phonetics: { us: "/kɔːrn ɒn ðə kɑːb/", gb: "/kɔːn ɒn ðə kɒb/", br: "/ˈmi.ʎu ˈveʁ.dʒi/", pt: "/mɐ.sɐˈɾɔ.kɐ/", es: "/maˈθoɾka/", cl: "/ˈtʃoklo/", ar: "/ˈtʃoklo/", fr: "/e.pi də ma.is/", it: "/panˈnɔk.kja/" } 
      },
      { 
        source_term: "Gengibre", image: "", gender_pt: "m", 
        translations: { cl: "Jengibre", ar: "Jengibre", gb: "Ginger", us: "Ginger", pt: "Gengibre", es: "Jengibre", fr: "Gingembre", it: "Zenzero" }, 
        phonetics: { us: "/ˈdʒɪn.dʒər/", gb: "/ˈdʒɪn.dʒə/", br: "/ʒẽˈʒi.bɾi/", pt: "/ʒẽˈʒi.bɾɨ/", es: "/xenˈxiβɾe/", cl: "/xenˈxiβɾe/", ar: "/xenˈxiβɾe/", fr: "/ʒɛ̃.ʒɑ̃bʁ/", it: "/ˈdzen.dze.ro/" } 
      },
      { 
        source_term: "Aspargos", image: "", gender_pt: "m", 
        translations: { cl: "Espárrago", ar: "Espárrago", gb: "Asparagus", us: "Asparagus", pt: "Espargo", es: "Espárrago", fr: "Asperge", it: "Asparago" }, 
        phonetics: { us: "/əˈspær.ə.ɡəs/", gb: "/əˈspær.ə.ɡəs/", br: "/asˈpaɾ.ɡus/", pt: "/ɨʃˈpaɾ.ɡu/", es: "/esˈparaɣo/", cl: "/esˈparaɣo/", ar: "/esˈparaɣo/", fr: "/as.pɛʁʒ/", it: "/asˈpa.ra.ɡo/" } 
      },
      { 
        source_term: "Cogumelo", image: "", gender_pt: "m", 
        translations: { cl: "Champiñón", ar: "Champiñón", gb: "Mushroom", us: "Mushroom", pt: "Cogumelo", es: "Champiñón", fr: "Champignon", it: "Fungo" }, 
        phonetics: { us: "/ˈmʌʃ.ruːm/", gb: "/ˈmʌʃ.ruːm/", br: "/ko.ɡuˈmɛ.lu/", pt: "/ku.ɡuˈmɛ.lu/", es: "/tʃampiˈɲon/", cl: "/tʃampiˈɲon/", ar: "/tʃampiˈɲon/", fr: "/ʃɑ̃.pi.ɲɔ̃/", it: "/ˈfun.ɡo/" } 
      },
      { 
        source_term: "Aipo", image: "", gender_pt: "m", 
        translations: { cl: "Apio", ar: "Apio", gb: "Celery", us: "Celery", pt: "Aipo", es: "Apio", fr: "Céleri", it: "Sedano" }, 
        phonetics: { us: "/ˈsɛl.ər.i/", gb: "/ˈsɛl.ər.i/", br: "/ˈaj.pu/", pt: "/ˈaj.pu/", es: "/ˈapjo/", cl: "/ˈapjo/", ar: "/ˈapjo/", fr: "/se.lə.ʁi/", it: "/ˈsɛ.da.no/" } 
      },
      { 
        source_term: "Ervilha Torta", image: "", gender_pt: "f", 
        translations: { cl: "Arveja china", ar: "Arveja", gb: "Mange Tout", us: "Snow Peas", pt: "Ervilha torta", es: "Tirabeque", fr: "Pois mangetout", it: "Taccola" }, 
        phonetics: { us: "/snoʊ piːz/", gb: "/mɒ̃ʒ tuː/", br: "/eʁˈvi.ʎɐ ˈtɔʁ.tɐ/", pt: "/eɾˈvi.ʎɐ ˈtɔɾ.tɐ/", es: "/tiɾaˈβeke/", cl: "/aɾˈβexa ˈtʃina/", ar: "/aɾˈβexa/", fr: "/pwa mɑ̃ʒ.tu/", it: "/ˈtak.ko.la/" } 
      },
      { 
        source_term: "Broto de Feijão", image: "", gender_pt: "m", 
        translations: { cl: "Diente de dragón", ar: "Brotes de soja", gb: "Bean Sprouts", us: "Bean Sprouts", pt: "Rebentos de soja", es: "Brotes de soja", fr: "Pousses de soja", it: "Germogli di soia" }, 
        phonetics: { us: "/biːn spraʊts/", gb: "/biːn spraʊts/", br: "/ˈbɾo.tu dʒi fejˈʒɐ̃w/", pt: "/ʁɨˈbẽ.tuʃ dɨ ˈsɔ.ʒɐ/", es: "/ˈbɾotes ðe ˈsoxa/", cl: "/ˈdjente ðe ðɾaˈɣon/", ar: "/ˈbɾotes ðe ˈsoxa/", fr: "/pus də so.ʒa/", it: "/dʒerˈmoʎ.ʎi di ˈsɔ.ja/" } 
      },
      { 
        source_term: "Jiló", image: "", gender_pt: "m", 
        translations: { cl: "Jiló", ar: "Jiló", gb: "Scarlet Eggplant", us: "Scarlet Eggplant", pt: "Jiló", es: "Jiló", fr: "Aubergine écarlate", it: "Melanzana scarlatta" }, 
        phonetics: { us: "/ˈskɑːr.lət ˈɛɡ.plænt/", gb: "/ˈskɑː.lət ˈɛɡ.plɑːnt/", br: "/ʒiˈlɔ/", pt: "/ʒiˈlɔ/", es: "/xiˈlo/", cl: "/xiˈlo/", ar: "/xiˈlo/", fr: "/o.bɛʁ.ʒin e.kaʁ.lat/", it: "/melanˈdza.na skarˈlat.ta/" } 
      },
      { 
        source_term: "Maxixe", image: "", gender_pt: "m", 
        translations: { cl: "Maxixe", ar: "Maxixe", gb: "Gherkin", us: "West Indian Gherkin", pt: "Maxixe", es: "Maxixe", fr: "Concombre des Antilles", it: "Cetriolo delle Antille" }, 
        phonetics: { us: "/ˈɡɜːr.kɪn/", gb: "/ˈɡɜː.kɪn/", br: "/maˈʃi.ʃi/", pt: "/mɐˈʃi.ʃɨ/", es: "/makˈsiʃe/", cl: "/makˈsiʃe/", ar: "/makˈsiʃe/", fr: "/kɔ̃.kɔ̃bʁ dez ɑ̃.tij/", it: "/tʃetriˈɔ.lo/" } 
      },
      { 
        source_term: "Nabo Redondo", image: "", gender_pt: "m", 
        translations: { cl: "Nabo", ar: "Nabo", gb: "Turnip", us: "Turnip", pt: "Nabo", es: "Nabo", fr: "Navet", it: "Rapa" }, 
        phonetics: { us: "/ˈtɜːr.nɪp/", gb: "/ˈtɜː.nɪp/", br: "/ˈna.bu/", pt: "/ˈna.bu/", es: "/ˈnaβo/", cl: "/ˈnaβo/", ar: "/ˈnaβo/", fr: "/na.vɛ/", it: "/ˈra.pa/" } 
      },
      { 
        source_term: "Cebola Branca", image: "", gender_pt: "f", 
        translations: { cl: "Cebolla blanca", ar: "Cebolla blanca", gb: "White Onion", us: "White Onion", pt: "Cebola branca", es: "Cebolla blanca", fr: "Oignon blanc", it: "Cipolla bianca" }, 
        phonetics: { us: "/waɪt ˈʌn.jən/", gb: "/waɪt ˈʌn.jən/", br: "/seˈbo.lɐ ˈbɾɐ̃.kɐ/", pt: "/sɨˈbo.lɐ ˈbɾɐ̃.kɐ/", es: "/θeˈβoʎa ˈβlaŋka/", cl: "/seˈβoʝa ˈβlaŋka/", ar: "/seˈβoʃa ˈβlaŋka/", fr: "/ɔ.ɲɔ̃ blɑ̃/", it: "/tʃiˈpol.la ˈbjaŋ.ka/" } 
      },
      { 
        source_term: "Batata Inglesa", image: "", gender_pt: "f", 
        translations: { cl: "Papa", ar: "Papa", gb: "Potato", us: "Potato", pt: "Batata", es: "Patata", fr: "Pomme de terre", it: "Patata" }, 
        phonetics: { us: "/pəˈteɪ.toʊ/", gb: "/pəˈteɪ.təʊ/", br: "/baˈta.tɐ ĩˈɡle.zɐ/", pt: "/bɐˈta.tɐ/", es: "/paˈtata/", cl: "/ˈpapa/", ar: "/ˈpapa/", fr: "/pɔm də tɛʁ/", it: "/paˈta.ta/" } 
      },
      { 
        source_term: "Abóbora Japonesa", image: "", gender_pt: "f", 
        translations: { cl: "Zapallo Kabocha", ar: "Zapallo Kabocha", gb: "Kabocha Squash", us: "Kabocha Squash", pt: "Abóbora Hokkaido", es: "Calabaza Kabocha", fr: "Potiron Kabocha", it: "Zucca Kabocha" }, 
        phonetics: { us: "/kəˈboʊ.tʃə skwɑːʃ/", gb: "/kəˈbəʊ.tʃə skwɒʃ/", br: "/aˈbɔ.bo.ɾɐ ʒa.poˈne.zɐ/", pt: "/ɐˈbɔ.bɔ.ɾɐ/", es: "/kalaˈβaθa kaˈbotʃa/", cl: "/saˈpaʝo kaˈbotʃa/", ar: "/saˈpaʃo kaˈbotʃa/", fr: "/pɔ.ti.ʁɔ̃/", it: "/ˈdzuk.ka/" } 
      },
  ],
  spices: [
      { 
        source_term: "Alho", image: "", gender_pt: "m", 
        translations: { cl: "Ajo", ar: "Ajo", gb: "Garlic", us: "Garlic", pt: "Alho", es: "Ajo", fr: "Ail", it: "Aglio" }, 
        phonetics: { us: "/ˈɡɑːr.lɪk/", gb: "/ˈɡɑː.lɪk/", br: "/ˈa.ʎu/", pt: "/ˈa.ʎu/", es: "/ˈaxo/", cl: "/ˈaxo/", ar: "/ˈaxo/", fr: "/aj/", it: "/ˈaʎ.ʎo/" } 
      },
      { 
        source_term: "Salsa", image: "", gender_pt: "f", 
        translations: { cl: "Perejil", ar: "Perejil", gb: "Parsley", us: "Parsley", pt: "Salsa", es: "Perejil", fr: "Persil", it: "Prezzemolo" }, 
        phonetics: { us: "/ˈpɑːr.sli/", gb: "/ˈpɑː.sli/", br: "/ˈsaw.sɐ/", pt: "/ˈsal.sɐ/", es: "/peɾeˈxil/", cl: "/peɾeˈxil/", ar: "/peɾeˈxil/", fr: "/pɛʁ.sil/", it: "/pretsˈtse.mo.lo/" } 
      },
      { 
        source_term: "Coentro", image: "", gender_pt: "m", 
        translations: { cl: "Cilantro", ar: "Cilantro", gb: "Coriander", us: "Cilantro", pt: "Coentros", es: "Cilantro", fr: "Coriandre", it: "Coriandolo" }, 
        phonetics: { us: "/sɪˈlæn.troʊ/", gb: "/ˌkɒr.iˈæn.dər/", br: "/koˈẽ.tɾu/", pt: "/kuˈẽ.tɾuʃ/", es: "/θiˈlantɾo/", cl: "/siˈlantɾo/", ar: "/siˈlantɾo/", fr: "/kɔ.ʁjɑ̃dʁ/", it: "/koˈrjan.do.lo/" } 
      },
      { 
        source_term: "Manjericão", image: "", gender_pt: "m", 
        translations: { cl: "Albahaca", ar: "Albahaca", gb: "Basil", us: "Basil", pt: "Manjericão", es: "Albahaca", fr: "Basilic", it: "Basilico" }, 
        phonetics: { us: "/ˈbeɪ.zəl/", gb: "/ˈbæz.əl/", br: "/mɐ̃.ʒe.ɾiˈkɐ̃w/", pt: "/mɐ̃.ʒɨ.ɾiˈkɐ̃w/", es: "/alβaˈaka/", cl: "/alβaˈaka/", ar: "/alβaˈaka/", fr: "/ba.zi.lik/", it: "/baˈzi.li.ko/" } 
      },
      { 
        source_term: "Orégano", image: "", gender_pt: "m", 
        translations: { cl: "Orégano", ar: "Orégano", gb: "Oregano", us: "Oregano", pt: "Orégãos", es: "Orégano", fr: "Origan", it: "Origano" }, 
        phonetics: { us: "/əˈrɛɡ.ə.noʊ/", gb: "/ˌɒr.ɪˈɡɑː.nəʊ/", br: "/oˈɾɛ.ɡa.nu/", pt: "/ɔˈɾɛ.ɡɐ̃w̃ʃ/", es: "/oˈɾeɣano/", cl: "/oˈɾeɣano/", ar: "/oˈɾeɣano/", fr: "/ɔ.ʁi.ɡɑ̃/", it: "/oˈri.ɡa.no/" } 
      },
      { 
        source_term: "Pimenta do Reino", image: "", gender_pt: "f", 
        translations: { cl: "Pimienta negra", ar: "Pimienta negra", gb: "Black Pepper", us: "Black Pepper", pt: "Pimenta preta", es: "Pimienta negra", fr: "Poivre noir", it: "Pepe nero" }, 
        phonetics: { us: "/blæk ˈpɛp.ər/", gb: "/blæk ˈpɛp.ə/", br: "/piˈmẽ.tɐ du ˈhej.nu/", pt: "/piˈmẽ.tɐ ˈpɾe.tɐ/", es: "/piˈmjenta ˈneɣɾa/", cl: "/piˈmjenta ˈneɣɾa/", ar: "/piˈmjenta ˈneɣɾa/", fr: "/pwa.vʁə nwaʁ/", it: "/ˈpe.pe ˈne.ro/" } 
      },
      { 
        source_term: "Louro", image: "", gender_pt: "m", 
        translations: { cl: "Laurel", ar: "Laurel", gb: "Bay Leaf", us: "Bay Leaf", pt: "Louro", es: "Laurel", fr: "Laurier", it: "Alloro" }, 
        phonetics: { us: "/beɪ liːf/", gb: "/beɪ liːf/", br: "/ˈlow.ɾu/", pt: "/ˈlo.ɾu/", es: "/lauˈɾel/", cl: "/lauˈɾel/", ar: "/lauˈɾel/", fr: "/lɔ.ʁje/", it: "/alˈlɔ.ro/" } 
      },
      { 
        source_term: "Alecrim", image: "", gender_pt: "m", 
        translations: { cl: "Romero", ar: "Romero", gb: "Rosemary", us: "Rosemary", pt: "Alecrim", es: "Romero", fr: "Romarin", it: "Rosmarino" }, 
        phonetics: { us: "/ˈroʊz.mɛr.i/", gb: "/ˈrəʊz.mər.i/", br: "/a.leˈkɾĩ/", pt: "/ɐ.lɨˈkɾĩ/", es: "/roˈmeɾo/", cl: "/roˈmeɾo/", ar: "/roˈmeɾo/", fr: "/ʁɔ.ma.ʁɛ̃/", it: "/rozmaˈri.no/" } 
      },
      { 
        source_term: "Cebolinha", image: "", gender_pt: "f", 
        translations: { cl: "Ciboulette", ar: "Cebolla de verdeo", gb: "Chives", us: "Chives", pt: "Cebolinho", es: "Cebollino", fr: "Ciboulette", it: "Erba cipollina" }, 
        phonetics: { us: "/tʃaɪvz/", gb: "/tʃaɪvz/", br: "/se.boˈlĩ.ɲɐ/", pt: "/sɨ.buˈli.ɲu/", es: "/θeβoˈʎino/", cl: "/siβuˈlet/", ar: "/seˈβoʃa ðe βeɾˈðeo/", fr: "/si.bu.lɛt/", it: "/ˈɛr.ba tʃipolˈli.na/" } 
      },
      { 
        source_term: "Hortelã", image: "", gender_pt: "f", 
        translations: { cl: "Menta", ar: "Menta", gb: "Mint", us: "Mint", pt: "Hortelã", es: "Menta", fr: "Menthe", it: "Menta" }, 
        phonetics: { us: "/mɪnt/", gb: "/mɪnt/", br: "/ɔʁ.teˈlɐ̃/", pt: "/ɔɾ.tɨˈlɐ̃/", es: "/ˈmenta/", cl: "/ˈmenta/", ar: "/ˈmenta/", fr: "/mɑ̃t/", it: "/ˈmen.ta/" } 
      },
      { 
        source_term: "Sal", image: "", gender_pt: "m", 
        translations: { cl: "Sal", ar: "Sal", gb: "Salt", us: "Salt", pt: "Sal", es: "Sal", fr: "Sel", it: "Sale" }, 
        phonetics: { us: "/sɔːlt/", gb: "/sɒlt/", br: "/saw/", pt: "/sal/", es: "/sal/", cl: "/sal/", ar: "/sal/", fr: "/sɛl/", it: "/ˈsa.le/" } 
      },
      { 
        source_term: "Canela", image: "", gender_pt: "f", 
        translations: { cl: "Canela", ar: "Canela", gb: "Cinnamon", us: "Cinnamon", pt: "Canela", es: "Canela", fr: "Cannelle", it: "Cannella" }, 
        phonetics: { us: "/ˈsɪn.ə.mən/", gb: "/ˈsɪn.ə.mən/", br: "/kaˈnɛ.lɐ/", pt: "/kɐˈnɛ.lɐ/", es: "/kaˈnela/", cl: "/kaˈnela/", ar: "/kaˈnela/", fr: "/ka.nɛl/", it: "/kanˈnɛl.la/" } 
      },
      { 
        source_term: "Cominho", image: "", gender_pt: "m", 
        translations: { cl: "Comino", ar: "Comino", gb: "Cumin", us: "Cumin", pt: "Cominhos", es: "Comino", fr: "Cumin", it: "Cumino" }, 
        phonetics: { us: "/ˈkjuː.mɪn/", gb: "/ˈkjuː.mɪn/", br: "/koˈmĩ.ɲu/", pt: "/kuˈmi.ɲuʃ/", es: "/koˈmino/", cl: "/koˈmino/", ar: "/koˈmino/", fr: "/ky.mɛ̃/", it: "/kuˈmi.no/" } 
      },
      { 
        source_term: "Páprica", image: "", gender_pt: "f", 
        translations: { cl: "Páprika", ar: "Pimentón", gb: "Paprika", us: "Paprika", pt: "Colorau", es: "Pimentón", fr: "Paprika", it: "Paprika" }, 
        phonetics: { us: "/pəˈpriː.kə/", gb: "/ˈpæp.rɪ.kə/", br: "/ˈpa.pɾi.kɐ/", pt: "/ku.luˈɾaw/", es: "/pimenˈton/", cl: "/ˈpapɾika/", ar: "/pimenˈton/", fr: "/pa.pʁi.ka/", it: "/ˈpa.pri.ka/" } 
      },
      { 
        source_term: "Açafrão", image: "", gender_pt: "m", 
        translations: { cl: "Azafrán", ar: "Azafrán", gb: "Saffron", us: "Saffron", pt: "Açafrão", es: "Azafrán", fr: "Safran", it: "Zafferano" }, 
        phonetics: { us: "/ˈsæf.rən/", gb: "/ˈsæf.rən/", br: "/a.saˈfɾɐ̃w/", pt: "/ɐ.sɐˈfɾɐ̃w/", es: "/aθaˈfɾan/", cl: "/asaˈfɾan/", ar: "/asaˈfɾan/", fr: "/sa.fʁɑ̃/", it: "/dzaffeˈra.no/" } 
      },
      { 
        source_term: "Curry", image: "", gender_pt: "m", 
        translations: { cl: "Curry", ar: "Curry", gb: "Curry Powder", us: "Curry Powder", pt: "Caril", es: "Curry", fr: "Curry", it: "Curry" }, 
        phonetics: { us: "/ˈkɜːr.i/", gb: "/ˈkʌr.i/", br: "/ˈkə.ʁi/", pt: "/kɐˈɾil/", es: "/ˈkari/", cl: "/ˈkari/", ar: "/ˈkari/", fr: "/ka.ʁi/", it: "/ˈkar.ri/" } 
      },
      { 
        source_term: "Noz-moscada", image: "", gender_pt: "f", 
        translations: { cl: "Nuez moscada", ar: "Nuez moscada", gb: "Nutmeg", us: "Nutmeg", pt: "Noz-moscada", es: "Nuez moscada", fr: "Muscade", it: "Noce moscata" }, 
        phonetics: { us: "/ˈnʌt.mɛɡ/", gb: "/ˈnʌt.mɛɡ/", br: "/nɔz.mosˈka.dɐ/", pt: "/nɔʒ.muʃˈka.dɐ/", es: "/nweθ mosˈkaða/", cl: "/nwes mosˈkaða/", ar: "/nwes mosˈkaða/", fr: "/mys.kad/", it: "/ˈno.tʃe mosˈka.ta/" } 
      },
      { 
        source_term: "Cravo", image: "", gender_pt: "m", 
        translations: { cl: "Clavo de olor", ar: "Clavo de olor", gb: "Cloves", us: "Cloves", pt: "Cravinho", es: "Clavo", fr: "Clou de girofle", it: "Chiodi di garofano" }, 
        phonetics: { us: "/kloʊvz/", gb: "/kləʊvz/", br: "/ˈkɾa.vu/", pt: "/kɾɐˈvi.ɲu/", es: "/ˈklaβo/", cl: "/ˈklaβo/", ar: "/ˈklaβo/", fr: "/klu də ʒi.ʁɔfl/", it: "/ˈkjɔ.do di ɡaˈrɔ.fa.no/" } 
      },
      { 
        source_term: "Gengibre em pó", image: "", gender_pt: "m", 
        translations: { cl: "Jengibre en polvo", ar: "Jengibre en polvo", gb: "Ground Ginger", us: "Ground Ginger", pt: "Gengibre em pó", es: "Jengibre en polvo", fr: "Gingembre en poudre", it: "Zenzero in polvere" }, 
        phonetics: { us: "/ɡraʊnd ˈdʒɪn.dʒər/", gb: "/ɡraʊnd ˈdʒɪn.dʒə/", br: "/ʒẽˈʒi.bɾi ẽ pɔ/", pt: "/ʒẽˈʒi.bɾɨ ẽ pɔ/", es: "/xenˈxiβɾe em ˈpolbo/", cl: "/xenˈxiβɾe em ˈpolbo/", ar: "/xenˈxiβɾe em ˈpolbo/", fr: "/ʒɛ̃.ʒɑ̃bʁ ɑ̃ pudʁ/", it: "/ˈdzen.dze.ro im ˈpol.ve.re/" } 
      },
      { 
        source_term: "Pimenta Caiena", image: "", gender_pt: "f", 
        translations: { cl: "Pimienta de Cayena", ar: "Pimienta de Cayena", gb: "Cayenne Pepper", us: "Cayenne Pepper", pt: "Pimenta caiena", es: "Pimienta de Cayena", fr: "Poivre de Cayenne", it: "Pepe di Caienna" }, 
        phonetics: { us: "/kaɪˈɛn ˈpɛp.ər/", gb: "/keɪˈɛn ˈpɛp.ə/", br: "/piˈmẽ.tɐ kaˈje.nɐ/", pt: "/piˈmẽ.tɐ kaˈje.nɐ/", es: "/piˈmjenta ðe kaˈʝena/", cl: "/piˈmjenta ðe kaˈʝena/", ar: "/piˈmjenta ðe kaˈʃena/", fr: "/pwa.vʁə də ka.jɛn/", it: "/ˈpe.pe di kaˈjɛn.na/" } 
      },
      { 
        source_term: "Tomilho", image: "", gender_pt: "m", 
        translations: { cl: "Tomillo", ar: "Tomillo", gb: "Thyme", us: "Thyme", pt: "Tomilho", es: "Tomillo", fr: "Thym", it: "Timo" }, 
        phonetics: { us: "/taɪm/", gb: "/taɪm/", br: "/toˈmi.ʎu/", pt: "/tuˈmi.ʎu/", es: "/toˈmiʎo/", cl: "/toˈmiʝo/", ar: "/toˈmiʃo/", fr: "/tɛ̃/", it: "/ˈti.mo/" } 
      },
      { 
        source_term: "Sálvia", image: "", gender_pt: "f", 
        translations: { cl: "Salvia", ar: "Salvia", gb: "Sage", us: "Sage", pt: "Salva", es: "Salvia", fr: "Sauge", it: "Salvia" }, 
        phonetics: { us: "/seɪdʒ/", gb: "/seɪdʒ/", br: "/ˈsaw.vjɐ/", pt: "/ˈsal.vɐ/", es: "/ˈsalβja/", cl: "/ˈsalβja/", ar: "/ˈsalβja/", fr: "/soʒ/", it: "/ˈsal.vja/" } 
      },
      { 
        source_term: "Endro", image: "", gender_pt: "m", 
        translations: { cl: "Eneldo", ar: "Eneldo", gb: "Dill", us: "Dill", pt: "Endro", es: "Eneldo", fr: "Aneth", it: "Aneto" }, 
        phonetics: { us: "/dɪl/", gb: "/dɪl/", br: "/ˈẽ.dɾu/", pt: "/ˈẽ.dɾu/", es: "/eˈneldo/", cl: "/eˈneldo/", ar: "/eˈneldo/", fr: "/a.nɛt/", it: "/aˈne.to/" } 
      },
      { 
        source_term: "Estragão", image: "", gender_pt: "m", 
        translations: { cl: "Estragón", ar: "Estragón", gb: "Tarragon", us: "Tarragon", pt: "Estragão", es: "Estragón", fr: "Estragon", it: "Dragoncello" }, 
        phonetics: { us: "/ˈtær.ə.ɡən/", gb: "/ˈtær.ə.ɡən/", br: "/is.tɾaˈɡɐ̃w/", pt: "/ɨʃ.tɾɐˈɡɐ̃w/", es: "/estɾaˈɣon/", cl: "/estɾaˈɣon/", ar: "/estɾaˈɣon/", fr: "/ɛs.tʁa.ɡɔ̃/", it: "/dra.ɡonˈtʃɛl.lo/" } 
      },
      { 
        source_term: "Colorau", image: "", gender_pt: "m", 
        translations: { cl: "Ají de color", ar: "Pimentón dulce", gb: "Annatto", us: "Annatto", pt: "Colorau", es: "Pimentón dulce", fr: "Roucou", it: "Annatto" }, 
        phonetics: { us: "/əˈnætoʊ/", gb: "/əˈnætəʊ/", br: "/ko.loˈɾaw/", pt: "/ku.luˈɾaw/", es: "/pimenˈton ˈdulθe/", cl: "/aˈxi ðe koˈloɾ/", ar: "/pimenˈton ˈdulse/", fr: "/ʁu.ku/", it: "/anˈnat.to/" } 
      },
  ]
};
