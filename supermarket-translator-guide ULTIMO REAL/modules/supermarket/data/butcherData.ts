
export const butcherData: Record<string, { source_term: string; image: string; gender_pt: 'm' | 'f'; translations: Record<string, string>; phonetics?: Record<string, string> }[]> = {
  beef: [
      { 
        source_term: "Picanha", image: "", gender_pt: "f", 
        translations: { cl: "Punta de Ganso", ar: "Tapa de cuadril", gb: "Rump Cap", us: "Sirloin Cap", pt: "Picanha", es: "Tapa de cuadril", fr: "Aiguillette de rumsteck", it: "Copertina di scamone" }, 
        phonetics: { us: "/ˈsɜːr.lɔɪn kæp/", gb: "/rʌmp kæp/", br: "/piˈkɐ.ɲɐ/", pt: "/piˈkɐ.ɲɐ/", es: "/ˈtapa ðe kwaˈðɾil/", cl: "/ˈpunta ðe ˈɣanso/", ar: "/ˈtapa ðe kwaˈðɾil/", fr: "/e.ɡɥi.jɛt də ʁɔm.stɛk/", it: "/koperˈti.na di skaˈmo.ne/" } 
      },
      { 
        source_term: "Filé Mignon", image: "", gender_pt: "m", 
        translations: { cl: "Filete", ar: "Lomo", gb: "Fillet Steak", us: "Filet Mignon", pt: "Lombo", es: "Solomillo", fr: "Filet mignon", it: "Filetto" }, 
        phonetics: { us: "/ˌfɪl.eɪ mɪnˈjɒn/", gb: "/ˈfɪl.ɪt steɪk/", br: "/fiˈlɛ mĩˈɲõ/", pt: "/ˈlõ.bu/", es: "/soloˈmiʎo/", cl: "/fiˈlete/", ar: "/ˈlomo/", fr: "/fi.lɛ mi.ɲɔ̃/", it: "/fiˈlet.to/" } 
      },
      { 
        source_term: "Contrafilé", image: "", gender_pt: "m", 
        translations: { cl: "Lomo vetado", ar: "Bife de chorizo", gb: "Sirloin Steak", us: "New York Strip", pt: "Vazia", es: "Entrecot", fr: "Faux-filet", it: "Controfiletto" }, 
        phonetics: { us: "/nuː jɔːrk strɪp/", gb: "/ˈsɜː.lɔɪn steɪk/", br: "/kõ.tɾa.fiˈlɛ/", pt: "/vɐˈzi.ɐ/", es: "/entɾeˈkot/", cl: "/ˈlomo βeˈtaðo/", ar: "/ˈbife ðe tʃoˈɾiso/", fr: "/fo.fi.lɛ/", it: "/kontrofiˈlet.to/" } 
      },
      { 
        source_term: "Alcatra", image: "", gender_pt: "f", 
        translations: { cl: "Asiento", ar: "Cuadril", gb: "Rump Steak", us: "Top Sirloin", pt: "Alcatra", es: "Cadera", fr: "Rumsteck", it: "Scamone" }, 
        phonetics: { us: "/tɑːp ˈsɜːr.lɔɪn/", gb: "/rʌmp steɪk/", br: "/awˈka.tɾɐ/", pt: "/ɐlˈka.tɾɐ/", es: "/kaˈðeɾa/", cl: "/aˈsjento/", ar: "/kwaˈðɾil/", fr: "/ʁɔm.stɛk/", it: "/skaˈmo.ne/" } 
      },
      { 
        source_term: "Carne Moída", image: "", gender_pt: "f", 
        translations: { cl: "Carne molida", ar: "Carne picada", gb: "Minced Meat", us: "Ground Beef", pt: "Carne picada", es: "Carne picada", fr: "Viande hachée", it: "Carne macinata" }, 
        phonetics: { us: "/ɡraʊnd biːf/", gb: "/mɪnst miːt/", br: "/ˈkaʁ.ni moˈi.dɐ/", pt: "/ˈkaɾ.nɨ piˈka.dɐ/", es: "/ˈkaɾne piˈkaða/", cl: "/ˈkaɾne moˈliða/", ar: "/ˈkaɾne piˈkaða/", fr: "/vjɑ̃d a.ʃe/", it: "/ˈkar.ne matʃiˈna.ta/" } 
      },
      { 
        source_term: "Bife", image: "", gender_pt: "m", 
        translations: { cl: "Bistec", ar: "Bife", gb: "Steak", us: "Steak", pt: "Bife", es: "Filete/Bistec", fr: "Steak", it: "Bistecca" }, 
        phonetics: { us: "/steɪk/", gb: "/steɪk/", br: "/ˈbi.fi/", pt: "/ˈbi.fɨ/", es: "/fiˈlete/", cl: "/bisˈtek/", ar: "/ˈbife/", fr: "/stɛk/", it: "/biˈstek.ka/" } 
      },
      { 
        source_term: "Fígado", image: "", gender_pt: "m", 
        translations: { cl: "Hígado", ar: "Hígado", gb: "Liver", us: "Liver", pt: "Fígado", es: "Hígado", fr: "Foie", it: "Fegato" }, 
        phonetics: { us: "/ˈlɪv.ər/", gb: "/ˈlɪv.ə/", br: "/ˈfi.ɡa.du/", pt: "/ˈfi.ɡɐ.du/", es: "/ˈiɣaðo/", cl: "/ˈiɣaðo/", ar: "/ˈiɣaðo/", fr: "/fwa/", it: "/ˈfe.ɡa.to/" } 
      },
      { 
        source_term: "Costela", image: "", gender_pt: "f", 
        translations: { cl: "Costilla", ar: "Asado de tira", gb: "Ribs", us: "Ribs", pt: "Costela", es: "Costilla", fr: "Côtes", it: "Costata" }, 
        phonetics: { us: "/rɪbz/", gb: "/rɪbz/", br: "/kosˈtɛ.lɐ/", pt: "/kuʃˈtɛ.lɐ/", es: "/kosˈtiʎa/", cl: "/kosˈtiʝa/", ar: "/aˈsaðo ðe ˈtiɾa/", fr: "/kot/", it: "/koˈsta.ta/" } 
      },
      { 
        source_term: "Maminha", image: "", gender_pt: "f", 
        translations: { cl: "Punta de picana", ar: "Colita de cuadril", gb: "Tri-tip", us: "Tri-tip", pt: "Maminha", es: "Rabillo de cadera", fr: "Aiguillette baronne", it: "Spinacino" }, 
        phonetics: { us: "/traɪ tɪp/", gb: "/traɪ tɪp/", br: "/maˈmĩ.ɲɐ/", pt: "/mɐˈmi.ɲɐ/", es: "/raˈβiʎo ðe kaˈðeɾa/", cl: "/ˈpunta ðe piˈkana/", ar: "/koˈlita ðe kwaˈðɾil/", fr: "/e.ɡɥi.jɛt ba.ʁɔn/", it: "/spinaˈtʃi.no/" } 
      },
      { 
        source_term: "Coxão Mole", image: "", gender_pt: "m", 
        translations: { cl: "Posta rosada", ar: "Nalga", gb: "Topside", us: "Top Round", pt: "Chã de dentro", es: "Babilla", fr: "Tende de tranche", it: "Fesa" }, 
        phonetics: { us: "/tɑːp raʊnd/", gb: "/ˈtɒp.saɪd/", br: "/koˈʃɐ̃w ˈmɔ.li/", pt: "/ʃɐ̃ dɨ ˈdẽ.tɾu/", es: "/baˈβiʎa/", cl: "/ˈposta roˈsaða/", ar: "/ˈnalɣa/", fr: "/tɑ̃d də tʁɑ̃ʃ/", it: "/ˈfe.za/" } 
      },
      { 
        source_term: "Coxão Duro", image: "", gender_pt: "m", 
        translations: { cl: "Posta negra", ar: "Cuadrada", gb: "Silverside", us: "Bottom Round", pt: "Chã de fora", es: "Contra", fr: "Gîte à la noix", it: "Sottofesa" }, 
        phonetics: { us: "/ˈbɑː.təm raʊnd/", gb: "/ˈsɪl.və.saɪd/", br: "/koˈʃɐ̃w ˈdu.ɾu/", pt: "/ʃɐ̃ dɨ ˈfɔ.ɾɐ/", es: "/ˈkontɾa/", cl: "/ˈposta ˈneɣɾa/", ar: "/kwaˈðɾaða/", fr: "/ʒit a la nwa/", it: "/sottoˈfe.za/" } 
      },
      { 
        source_term: "Lagarto", image: "", gender_pt: "m", 
        translations: { cl: "Pollo ganso", ar: "Peceto", gb: "Eye of Round", us: "Eye of Round", pt: "Rojões", es: "Redondo", fr: "Rond de gîte", it: "Girello" }, 
        phonetics: { us: "/aɪ ʌv raʊnd/", gb: "/aɪ ɒv raʊnd/", br: "/laˈɡaʁ.tu/", pt: "/ʁuˈʒõj̃ʃ/", es: "/reˈðondo/", cl: "/ˈpoʝo ˈɣanso/", ar: "/peˈseto/", fr: "/ʁɔ̃ də ʒit/", it: "/dʒiˈrɛl.lo/" } 
      },
      { 
        source_term: "Fraldinha", image: "", gender_pt: "f", 
        translations: { cl: "Palanca", ar: "Vacío", gb: "Flank Steak", us: "Flank Steak", pt: "Fraldinha", es: "Falda", fr: "Bavette", it: "Bavetta" }, 
        phonetics: { us: "/flæŋk steɪk/", gb: "/flæŋk steɪk/", br: "/fɾawˈdʒĩ.ɲɐ/", pt: "/fɾaɫˈdi.ɲɐ/", es: "/ˈfalda/", cl: "/paˈlaŋka/", ar: "/baˈsio/", fr: "/ba.vɛt/", it: "/baˈvet.ta/" } 
      },
      { 
        source_term: "Acém", image: "", gender_pt: "m", 
        translations: { cl: "Huachalomo", ar: "Aguja", gb: "Chuck", us: "Chuck", pt: "Acém", es: "Aguja", fr: "Basses côtes", it: "Reale" }, 
        phonetics: { us: "/tʃʌk/", gb: "/tʃʌk/", br: "/aˈsẽj/", pt: "/ɐˈsɐ̃j/", es: "/aˈɣuxa/", cl: "/watʃaˈlomo/", ar: "/aˈɣuxa/", fr: "/bas kot/", it: "/reˈa.le/" } 
      },
      { 
        source_term: "Músculo", image: "", gender_pt: "m", 
        translations: { cl: "Osobuco", ar: "Osobuco", gb: "Shin", us: "Shank", pt: "Músculo", es: "Morcillo", fr: "Jarret", it: "Ossobuco" }, 
        phonetics: { us: "/ʃæŋk/", gb: "/ʃɪn/", br: "/ˈmus.ku.lu/", pt: "/ˈmuʃ.ku.lu/", es: "/moɾˈθiʎo/", cl: "/osoˈβuko/", ar: "/osoˈβuko/", fr: "/ʒa.ʁɛ/", it: "/ɔssoˈbu.ko/" } 
      },
      { 
        source_term: "Hambúrguer", image: "", gender_pt: "m", 
        translations: { cl: "Hamburguesa", ar: "Hamburguesa", gb: "Burger", us: "Burger", pt: "Hambúrguer", es: "Hamburguesa", fr: "Steak haché", it: "Hamburger" }, 
        phonetics: { us: "/ˈbɜːr.ɡər/", gb: "/ˈbɜː.ɡə/", br: "/ɐ̃ˈbuʁ.ɡeʁ/", pt: "/ɐ̃ˈbuɾ.ɡɛɾ/", es: "/ambuɾˈɣesa/", cl: "/ambuɾˈɣesa/", ar: "/ambuɾˈɣesa/", fr: "/stɛk a.ʃe/", it: "/amˈbur.ger/" } 
      },
      { 
        source_term: "Almôndegas", image: "", gender_pt: "f", 
        translations: { cl: "Albóndigas", ar: "Albóndigas", gb: "Meatballs", us: "Meatballs", pt: "Almôndegas", es: "Albóndigas", fr: "Boulettes de viande", it: "Polpette" }, 
        phonetics: { us: "/ˈmiːt.bɔːlz/", gb: "/ˈmiːt.bɔːlz/", br: "/awˈmõ.de.ɡas/", pt: "/aɫˈmõ.dɨ.ɡɐʃ/", es: "/alˈβondiɣas/", cl: "/alˈβondiɣas/", ar: "/alˈβondiɣas/", fr: "/bu.lɛt də vjɑ̃d/", it: "/polˈpet.te/" } 
      },
      { 
        source_term: "Língua", image: "", gender_pt: "f", 
        translations: { cl: "Lengua", ar: "Lengua", gb: "Tongue", us: "Tongue", pt: "Língua", es: "Lengua", fr: "Langue", it: "Lingua" }, 
        phonetics: { us: "/tʌŋ/", gb: "/tʌŋ/", br: "/ˈlĩ.ɡwɐ/", pt: "/ˈlĩ.ɡwɐ/", es: "/ˈleŋɡwa/", cl: "/ˈleŋɡwa/", ar: "/ˈleŋɡwa/", fr: "/lɑ̃ɡ/", it: "/ˈlin.ɡwa/" } 
      },
      { 
        source_term: "Dobradinha/Bucho", image: "", gender_pt: "m", 
        translations: { cl: "Guatitas", ar: "Mondongo", gb: "Tripe", us: "Tripe", pt: "Dobrada", es: "Callos", fr: "Tripes", it: "Trippa" }, 
        phonetics: { us: "/traɪp/", gb: "/traɪp/", br: "/do.bɾaˈdʒĩ.ɲɐ/", pt: "/duˈbɾa.dɐ/", es: "/ˈkaʎos/", cl: "/ɡwaˈtitas/", ar: "/monˈdoŋɡo/", fr: "/tʁip/", it: "/ˈtrip.pa/" } 
      },
      { 
        source_term: "Rabada", image: "", gender_pt: "f", 
        translations: { cl: "Cola de buey", ar: "Rabo", gb: "Oxtail", us: "Oxtail", pt: "Rabo de boi", es: "Rabo de toro", fr: "Queue de bœuf", it: "Coda" }, 
        phonetics: { us: "/ˈɑːks.teɪl/", gb: "/ˈɒks.teɪl/", br: "/haˈba.dɐ/", pt: "/ˈʁa.bu dɨ boj/", es: "/ˈraβo ðe ˈtoɾo/", cl: "/ˈkola ðe ˈβwei/", ar: "/ˈraβo/", fr: "/kø də bœf/", it: "/ˈko.da/" } 
      },
      { 
        source_term: "Cupim", image: "", gender_pt: "m", 
        translations: { cl: "Joroba", ar: "Joroba", gb: "Hump", us: "Hump steak", pt: "Cupim", es: "Giba", fr: "Bosse", it: "Gobba" }, 
        phonetics: { us: "/hʌmp steɪk/", gb: "/hʌmp steɪk/", br: "/kuˈpĩ/", pt: "/kuˈpĩ/", es: "/ˈxiβa/", cl: "/xoˈɾoβa/", ar: "/xoˈɾoβa/", fr: "/bɔs/", it: "/ˈɡɔb.ba/" } 
      },
      { 
        source_term: "Carne Seca", image: "", gender_pt: "f", 
        translations: { cl: "Charqui", ar: "Tasajo", gb: "Dried Beef", us: "Jerky", pt: "Carne seca", es: "Cecina", fr: "Viande séchée", it: "Carne secca" }, 
        phonetics: { us: "/ˈdʒɜːr.ki/", gb: "/draɪd biːf/", br: "/ˈkaʁ.ni ˈse.kɐ/", pt: "/ˈkaɾ.nɨ ˈse.kɐ/", es: "/θeˈθina/", cl: "/ˈtʃaɾki/", ar: "/taˈsaxo/", fr: "/vjɑ̃d se.ʃe/", it: "/ˈkar.ne ˈsek.ka/" } 
      },
      { 
        source_term: "Ossobuco", image: "", gender_pt: "m", 
        translations: { cl: "Osobuco", ar: "Osobuco", gb: "Ossobuco", us: "Ossobuco", pt: "Ossobuco", es: "Ossobuco", fr: "Osso bucco", it: "Ossobuco" }, 
        phonetics: { us: "/ˌɒs.oʊˈbuː.koʊ/", gb: "/ˌɒs.əʊˈbuː.kəʊ/", br: "/o.soˈbu.ku/", pt: "/o.suˈbu.ku/", es: "/osoˈβuko/", cl: "/osoˈβuko/", ar: "/osoˈβuko/", fr: "/ɔ.so bu.ko/", it: "/ɔssoˈbu.ko/" } 
      },
      { 
        source_term: "Fralda", image: "", gender_pt: "f", 
        translations: { cl: "Entraña", ar: "Entraña", gb: "Skirt Steak", us: "Skirt Steak", pt: "Entranha", es: "Entraña", fr: "Hampe", it: "Diaframma" }, 
        phonetics: { us: "/skɜːrt steɪk/", gb: "/skɜːt steɪk/", br: "/fɾawˈdʒĩ.ɲɐ/", pt: "/ẽˈtɾa.ɲɐ/", es: "/enˈtɾaɲa/", cl: "/enˈtɾaɲa/", ar: "/enˈtɾaɲa/", fr: "/ɑ̃p/", it: "/djaˈfram.ma/" } 
      },
      { 
        source_term: "Miolo de Alcatra", image: "", gender_pt: "m", 
        translations: { cl: "Asiento de picana", ar: "Corazón de cuadril", gb: "Heart of Rump", us: "Center Cut Sirloin", pt: "Coração da alcatra", es: "Corazón de cadera", fr: "Cœur de rumsteck", it: "Cuore di scamone" }, 
        phonetics: { us: "/ˈsɛn.tər kʌt ˈsɜːr.lɔɪn/", gb: "/hɑːt ɒv rʌmp/", br: "/miˈo.lu dʒi awˈka.tɾɐ/", pt: "/ku.ɾɐˈsɐ̃w dɐ ɐlˈka.tɾɐ/", es: "/koɾaˈθon de kaˈðeɾa/", cl: "/aˈsjento ðe piˈkana/", ar: "/koɾaˈson de kwaˈðɾil/", fr: "/kœʁ də ʁɔm.stɛk/", it: "/ˈkwɔ.re di skaˈmo.ne/" } 
      },
  ],
  pork: [
      { 
        source_term: "Costela de Porco", image: "", gender_pt: "f", 
        translations: { cl: "Costillar de cerdo", ar: "Costilla de cerdo", gb: "Pork Ribs", us: "Pork Ribs", pt: "Entrecosto", es: "Costillas de cerdo", fr: "Travers de porc", it: "Costolette di maiale" }, 
        phonetics: { us: "/pɔːrk rɪbz/", gb: "/pɔːk rɪbz/", br: "/kosˈtɛ.lɐ dʒi ˈpoʁ.ku/", pt: "/ẽ.tɾɨˈkoʃ.tu/", es: "/kosˈtiʎas ðe ˈθeɾðo/", cl: "/kostiˈʝaɾ ðe ˈseɾðo/", ar: "/kosˈtiʃas ðe ˈseɾðo/", fr: "/tʁa.vɛʁ də pɔʁ/", it: "/kostoˈlet.te di maˈja.le/" } 
      },
      { 
        source_term: "Lombo de Porco", image: "", gender_pt: "m", 
        translations: { cl: "Lomo de cerdo", ar: "Carré de cerdo", gb: "Pork Loin", us: "Pork Loin", pt: "Lombo de porco", es: "Lomo de cerdo", fr: "Filet de porc", it: "Lonza di maiale" }, 
        phonetics: { us: "/pɔːrk lɔɪn/", gb: "/pɔːk lɔɪn/", br: "/ˈlõ.bu dʒi ˈpoʁ.ku/", pt: "/ˈlõ.bu dɨ ˈpoɾ.ku/", es: "/ˈlomo ðe ˈθeɾðo/", cl: "/ˈlomo ðe ˈseɾðo/", ar: "/kaˈre ðe ˈseɾðo/", fr: "/fi.lɛ də pɔʁ/", it: "/ˈlon.dza di maˈja.le/" } 
      },
      { 
        source_term: "Bisteca", image: "", gender_pt: "f", 
        translations: { cl: "Chuleta de cerdo", ar: "Costeleta de cerdo", gb: "Pork Chop", us: "Pork Chop", pt: "Costeleta de porco", es: "Chuleta de cerdo", fr: "Côtelette de porc", it: "Braciola di maiale" }, 
        phonetics: { us: "/pɔːrk tʃɑːp/", gb: "/pɔːk tʃɒp/", br: "/bisˈtɛ.kɐ/", pt: "/kuʃ.tɨˈle.tɐ dɨ ˈpoɾ.ku/", es: "/tʃuˈleta ðe ˈθeɾðo/", cl: "/tʃuˈleta ðe ˈseɾðo/", ar: "/kosteˈleta ðe ˈseɾðo/", fr: "/kot.lɛt də pɔʁ/", it: "/braˈtʃɔ.la di maˈja.le/" } 
      },
      { 
        source_term: "Linguiça", image: "", gender_pt: "f", 
        translations: { cl: "Longaniza", ar: "Chorizo", gb: "Sausage", us: "Sausage", pt: "Salsicha fresca", es: "Salchicha fresca", fr: "Saucisse", it: "Salsiccia" }, 
        phonetics: { us: "/ˈsɔː.sɪdʒ/", gb: "/ˈsɒs.ɪdʒ/", br: "/lĩˈɡwi.sɐ/", pt: "/saɫˈsi.ʃɐ ˈfɾeʃ.kɐ/", es: "/salˈtʃitʃa ˈfɾeska/", cl: "/loŋɡaˈnisa/", ar: "/tʃoˈɾiso/", fr: "/so.sis/", it: "/salˈsit.tʃa/" } 
      },
      { 
        source_term: "Bacon", image: "", gender_pt: "m", 
        translations: { cl: "Tocino", ar: "Panceta", gb: "Bacon", us: "Bacon", pt: "Bacon", es: "Bacon", fr: "Lardons", it: "Pancetta" }, 
        phonetics: { us: "/ˈbeɪ.kən/", gb: "/ˈbeɪ.kən/", br: "/ˈbej.kõ/", pt: "/ˈbej.kõ/", es: "/ˈbeikon/", cl: "/toˈsino/", ar: "/panˈseta/", fr: "/laʁ.dɔ̃/", it: "/panˈtʃet.ta/" } 
      },
      { 
        source_term: "Pernil", image: "", gender_pt: "m", 
        translations: { cl: "Pierna de cerdo", ar: "Bondiola/Pernil", gb: "Gammon", us: "Pork Leg", pt: "Pernil", es: "Jamón de cerdo", fr: "Jambon de porc", it: "Coscia di maiale" }, 
        phonetics: { us: "/pɔːrk lɛɡ/", gb: "/ˈɡæm.ən/", br: "/peʁˈniw/", pt: "/pɨɾˈniɫ/", es: "/xaˈmon de ˈθeɾðo/", cl: "/ˈpjeɾna ðe ˈseɾðo/", ar: "/peɾˈnil/", fr: "/ʒɑ̃.bɔ̃ də pɔʁ/", it: "/ˈkɔʃ.ʃa di maˈja.le/" } 
      },
      { 
        source_term: "Barriga de Porco", image: "", gender_pt: "f", 
        translations: { cl: "Malaya", ar: "Matambre", gb: "Pork Belly", us: "Pork Belly", pt: "Entremeada", es: "Panceta", fr: "Poitrine de porc", it: "Pancetta" }, 
        phonetics: { us: "/pɔːrk ˈbɛl.i/", gb: "/pɔːk ˈbɛl.i/", br: "/baˈhi.ɡɐ dʒi ˈpoʁ.ku/", pt: "/ẽ.tɾɨ.meˈa.dɐ/", es: "/panˈθeta/", cl: "/maˈlaya/", ar: "/maˈtambɾe/", fr: "/pwa.tʁin də pɔʁ/", it: "/panˈtʃet.ta/" } 
      },
      { 
        source_term: "Carne de Porco Moída", image: "", gender_pt: "f", 
        translations: { cl: "Cerdo molido", ar: "Cerdo picado", gb: "Pork Mince", us: "Ground Pork", pt: "Carne de porco picada", es: "Carne picada de cerdo", fr: "Porc haché", it: "Macinato di maiale" }, 
        phonetics: { us: "/ɡraʊnd pɔːrk/", gb: "/pɔːk mɪns/", br: "/ˈkaʁ.ni dʒi ˈpoʁ.ku moˈi.dɐ/", pt: "/ˈkaɾ.nɨ dɨ ˈpoɾ.ku piˈka.dɐ/", es: "/ˈkaɾne piˈkaða ðe ˈθeɾðo/", cl: "/ˈseɾðo moˈliðo/", ar: "/ˈseɾðo piˈkaðo/", fr: "/pɔʁ a.ʃe/", it: "/matʃiˈna.to di maˈja.le/" } 
      },
      { 
        source_term: "Tender", image: "", gender_pt: "m", 
        translations: { cl: "Jamón ahumado", ar: "Jamón ahumado", gb: "Smoked Ham", us: "Smoked Ham", pt: "Presunto fumado", es: "Jamón ahumado", fr: "Jambon fumé", it: "Prosciutto affumicato" }, 
        phonetics: { us: "/smoʊkt hæm/", gb: "/sməʊkt hæm/", br: "/ˈtẽ.deʁ/", pt: "/pɾɨˈzũ.tu fuˈma.du/", es: "/xaˈmon auˈmaðo/", cl: "/xaˈmon auˈmaðo/", ar: "/xaˈmon auˈmaðo/", fr: "/ʒɑ̃.bɔ̃ fy.me/", it: "/proʃˈʃut.to affumiˈka.to/" } 
      },
      { 
        source_term: "Pé de Porco", image: "", gender_pt: "m", 
        translations: { cl: "Patitas de chancho", ar: "Patitas de cerdo", gb: "Trotters", us: "Pig's Feet", pt: "Pé de porco", es: "Manitas de cerdo", fr: "Pied de cochon", it: "Zampone" }, 
        phonetics: { us: "/pɪɡz fiːt/", gb: "/ˈtrɒt.əz/", br: "/pɛ dʒi ˈpoʁ.ku/", pt: "/pɛ dɨ ˈpoɾ.ku/", es: "/maˈnitas ðe ˈθeɾðo/", cl: "/paˈtitas ðe ˈtʃantʃo/", ar: "/paˈtitas ðe ˈseɾðo/", fr: "/pje də kɔ.ʃɔ̃/", it: "/dzamˈpo.ne/" } 
      },
      { 
        source_term: "Orelha de Porco", image: "", gender_pt: "f", 
        translations: { cl: "Oreja de cerdo", ar: "Oreja de cerdo", gb: "Pig's Ear", us: "Pig's Ear", pt: "Orelha de porco", es: "Oreja de cerdo", fr: "Oreille de cochon", it: "Orecchie di maiale" }, 
        phonetics: { us: "/pɪɡz ɪr/", gb: "/pɪɡz ɪə/", br: "/oˈɾe.ʎɐ dʒi ˈpoʁ.ku/", pt: "/oˈɾɐ.ʎɐ dɨ ˈpoɾ.ku/", es: "/oˈɾexa ðe ˈθeɾðo/", cl: "/oˈɾexa ðe ˈseɾðo/", ar: "/oˈɾexa ðe ˈseɾðo/", fr: "/ɔ.ʁɛj də kɔ.ʃɔ̃/", it: "/oˈrek.kje di maˈja.le/" } 
      },
      { 
        source_term: "Torresmo", image: "", gender_pt: "m", 
        translations: { cl: "Chicharrones", ar: "Chicharrones", gb: "Pork Scratchings", us: "Pork Rinds", pt: "Torresmos", es: "Torreznos", fr: "Grattons", it: "Ciccioli" }, 
        phonetics: { us: "/pɔːrk raɪndz/", gb: "/pɔːk ˈskrætʃ.ɪŋz/", br: "/toˈhez.mu/", pt: "/tuˈʁeʒ.muʃ/", es: "/toˈreθnos/", cl: "/tʃitʃaˈrrones/", ar: "/tʃitʃaˈrrones/", fr: "/ɡʁa.tɔ̃/", it: "/ˈtʃit.tʃo.li/" } 
      },
      { 
        source_term: "Paleta Suína", image: "", gender_pt: "f", 
        translations: { cl: "Paleta de cerdo", ar: "Paleta de cerdo", gb: "Pork Shoulder", us: "Pork Shoulder", pt: "Pá de porco", es: "Paleta de cerdo", fr: "Épaule de porc", it: "Spalla di maiale" }, 
        phonetics: { us: "/pɔːrk ˈʃoʊl.dər/", gb: "/pɔːk ˈʃəʊl.də/", br: "/paˈle.tɐ suˈi.nɐ/", pt: "/pa dɨ ˈpoɾ.ku/", es: "/paˈleta ðe ˈθeɾðo/", cl: "/paˈleta ðe ˈseɾðo/", ar: "/paˈleta ðe ˈseɾðo/", fr: "/e.pol də pɔʁ/", it: "/ˈspal.la di maˈja.le/" } 
      },
      { 
        source_term: "Suã", image: "", gender_pt: "f", 
        translations: { cl: "Espinazo", ar: "Espinazo", gb: "Pork Spine", us: "Pork Spine", pt: "Espinhaço", es: "Espinazo", fr: "Échine", it: "Spina dorsale" }, 
        phonetics: { us: "/pɔːrk spaɪn/", gb: "/pɔːk spaɪn/", br: "/suˈɐ̃/", pt: "/ɨʃ.piˈɲa.su/", es: "/espiˈnaθo/", cl: "/espiˈnaso/", ar: "/espiˈnaso/", fr: "/e.ʃin/", it: "/ˈspi.na dorˈsa.le/" } 
      },
      { 
        source_term: "Focinho", image: "", gender_pt: "m", 
        translations: { cl: "Hocico", ar: "Hocico", gb: "Snout", us: "Snout", pt: "Focinho", es: "Morro", fr: "Museau", it: "Muso" }, 
        phonetics: { us: "/snaʊt/", gb: "/snaʊt/", br: "/foˈsĩ.ɲu/", pt: "/fuˈsi.ɲu/", es: "/ˈmoro/", cl: "/oˈsiko/", ar: "/oˈsiko/", fr: "/my.zo/", it: "/ˈmu.zo/" } 
      },
      { 
        source_term: "Miúdos de Porco", image: "", gender_pt: "m", 
        translations: { cl: "Menudencias de cerdo", ar: "Achuras", gb: "Offal", us: "Variety Meats", pt: "Miúdos", es: "Casquería", fr: "Abats", it: "Frattaglie" }, 
        phonetics: { us: "/vəˈraɪ.ə.ti miːts/", gb: "/ˈɒf.əl/", br: "/miˈu.dus/", pt: "/miˈu.duʃ/", es: "/kaskeˈɾia/", cl: "/menuˈðensjas/", ar: "/aˈtʃuɾas/", fr: "/a.ba/", it: "/fratˈtaʎ.ʎe/" } 
      },
      { 
        source_term: "Banha de Porco", image: "", gender_pt: "f", 
        translations: { cl: "Manteca", ar: "Grasa de cerdo", gb: "Lard", us: "Lard", pt: "Banha", es: "Manteca de cerdo", fr: "Saindoux", it: "Strutto" }, 
        phonetics: { us: "/lɑːrd/", gb: "/lɑːd/", br: "/ˈbɐ̃.ɲɐ/", pt: "/ˈbɐ.ɲɐ/", es: "/manˈteka/", cl: "/manˈteka/", ar: "/ˈɡɾasa ðe ˈseɾðo/", fr: "/sɛ̃.du/", it: "/ˈstrut.to/" } 
      },
      { 
        source_term: "Filet Mignon Suíno", image: "", gender_pt: "m", 
        translations: { cl: "Filete de cerdo", ar: "Solomillo de cerdo", gb: "Pork Fillet", us: "Pork Tenderloin", pt: "Lombinho de porco", es: "Solomillo de cerdo", fr: "Filet mignon de porc", it: "Filetto di maiale" }, 
        phonetics: { us: "/pɔːrk ˈtɛn.dər.lɔɪn/", gb: "/pɔːk ˈfɪl.ɪt/", br: "/fiˈlɛ mĩˈɲõ suˈi.nu/", pt: "/lõˈbi.ɲu dɨ ˈpoɾ.ku/", es: "/soloˈmiʎo ðe ˈθeɾðo/", cl: "/fiˈlete ðe ˈseɾðo/", ar: "/soloˈmiʃo ðe ˈseɾðo/", fr: "/fi.lɛ mi.ɲɔ̃ də pɔʁ/", it: "/fiˈlet.to di maˈja.le/" } 
      },
      { 
        source_term: "Copa Lombo", image: "", gender_pt: "m", 
        translations: { cl: "Bondiola", ar: "Bondiola", gb: "Pork Collar", us: "Pork Shoulder Butt", pt: "Cachaço", es: "Cabezada de lomo", fr: "Échine", it: "Capocollo" }, 
        phonetics: { us: "/pɔːrk ˈʃoʊl.dər bʌt/", gb: "/pɔːk ˈkɒl.ə/", br: "/ˈkɔ.pɐ ˈlõ.bu/", pt: "/kɐˈʃa.su/", es: "/kaβeˈθaða/", cl: "/bonˈdjola/", ar: "/bonˈdjola/", fr: "/e.ʃin/", it: "/kapoˈkɔl.lo/" } 
      },
      { 
        source_term: "Toucinho", image: "", gender_pt: "m", 
        translations: { cl: "Tocino", ar: "Tocino", gb: "Fatback", us: "Fatback", pt: "Toucinho", es: "Tocino", fr: "Lard gras", it: "Lardo" }, 
        phonetics: { us: "/ˈfæt.bæk/", gb: "/ˈfæt.bæk/", br: "/towˈsĩ.ɲu/", pt: "/toˈsĩ.ɲu/", es: "/toˈθino/", cl: "/toˈsino/", ar: "/toˈsino/", fr: "/laʁ ɡʁa/", it: "/ˈlar.do/" } 
      },
      { 
        source_term: "Joelheira", image: "", gender_pt: "f", 
        translations: { cl: "Codillo", ar: "Codillo", gb: "Pork Hock", us: "Pork Hock", pt: "Joelho", es: "Codillo", fr: "Jarret", it: "Stinco" }, 
        phonetics: { us: "/pɔːrk hɑːk/", gb: "/pɔːk hɒk/", br: "/ʒo.eˈʎej.ɾɐ/", pt: "/ʒuˈɐ.ʎu/", es: "/koˈðiʎo/", cl: "/koˈðiʝo/", ar: "/koˈðiʃo/", fr: "/ʒa.ʁɛ/", it: "/ˈstiŋ.ko/" } 
      },
      { 
        source_term: "Papada", image: "", gender_pt: "f", 
        translations: { cl: "Papada", ar: "Papada", gb: "Jowl", us: "Jowl", pt: "Papada", es: "Papada", fr: "Joue", it: "Guanciale" }, 
        phonetics: { us: "/dʒaʊl/", gb: "/dʒaʊl/", br: "/paˈpa.dɐ/", pt: "/pɐˈpa.dɐ/", es: "/paˈpaða/", cl: "/paˈpaða/", ar: "/paˈpaða/", fr: "/ʒu/", it: "/ɡwanˈtʃa.le/" } 
      },
      { 
        source_term: "Rabo", image: "", gender_pt: "m", 
        translations: { cl: "Cola", ar: "Rabo", gb: "Tail", us: "Tail", pt: "Rabo", es: "Rabo", fr: "Queue", it: "Coda" }, 
        phonetics: { us: "/teɪl/", gb: "/teɪl/", br: "/ˈha.bu/", pt: "/ˈʁa.bu/", es: "/ˈraβo/", cl: "/ˈkola/", ar: "/ˈraβo/", fr: "/kø/", it: "/ˈko.da/" } 
      },
      { 
        source_term: "Sangue (Chouriço)", image: "", gender_pt: "m", 
        translations: { cl: "Sangre", ar: "Sangre", gb: "Blood (Black Pudding)", us: "Blood", pt: "Sangue", es: "Sangre", fr: "Sang", it: "Sangue" }, 
        phonetics: { us: "/blʌd/", gb: "/blʌd/", br: "/ˈsɐ̃.ɡi/", pt: "/ˈsɐ̃.ɡɨ/", es: "/ˈsaŋɡɾe/", cl: "/ˈsaŋɡɾe/", ar: "/ˈsaŋɡɾe/", fr: "/sɑ̃/", it: "/ˈsan.ɡwe/" } 
      },
      { 
        source_term: "Tripa", image: "", gender_pt: "f", 
        translations: { cl: "Tripa", ar: "Tripa", gb: "Casing", us: "Casing", pt: "Tripa", es: "Tripa", fr: "Boyau", it: "Budello" }, 
        phonetics: { us: "/ˈkeɪ.sɪŋ/", gb: "/ˈkeɪ.sɪŋ/", br: "/ˈtɾi.pɐ/", pt: "/ˈtɾi.pɐ/", es: "/ˈtɾipa/", cl: "/ˈtɾipa/", ar: "/ˈtɾipa/", fr: "/bwa.jo/", it: "/buˈdɛl.lo/" } 
      },
  ],
  chicken: [
      { 
        source_term: "Peito de Frango", image: "", gender_pt: "m", 
        translations: { cl: "Pechuga de pollo", ar: "Pechuga de pollo", gb: "Chicken Breast", us: "Chicken Breast", pt: "Peito de frango", es: "Pechuga de pollo", fr: "Blanc de poulet", it: "Petto di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn brɛst/", gb: "/ˈtʃɪk.ɪn brɛst/", br: "/ˈpej.tu dʒi ˈfɾɐ̃.ɡu/", pt: "/ˈpɐj.tu dɨ pɨˈɾu/", es: "/peˈtʃuɣa ðe ˈpoʎo/", cl: "/peˈtʃuɣa ðe ˈpoʝo/", ar: "/peˈtʃuɣa ðe ˈpoʃo/", fr: "/blɑ̃ də pu.lɛ/", it: "/ˈpet.to di ˈpol.lo/" } 
      },
      { 
        source_term: "Coxa de Frango", image: "", gender_pt: "f", 
        translations: { cl: "Trutro largo", ar: "Pata de pollo", gb: "Chicken Thigh", us: "Chicken Thigh", pt: "Coxa de frango", es: "Muslo de pollo", fr: "Cuisse de poulet", it: "Coscia di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn θaɪ/", gb: "/ˈtʃɪk.ɪn θaɪ/", br: "/ˈko.ʃɐ dʒi ˈfɾɐ̃.ɡu/", pt: "/ˈko.ʃɐ dɨ ˈfɾɐ̃.ɡu/", es: "/ˈmuslo ðe ˈpoʎo/", cl: "/ˈtɾutɾo ˈlaɾɣo/", ar: "/ˈpata ðe ˈpoʃo/", fr: "/kɥis də pu.lɛ/", it: "/ˈkɔʃ.ʃa di ˈpol.lo/" } 
      },
      { 
        source_term: "Sobrecoxa", image: "", gender_pt: "f", 
        translations: { cl: "Trutro corto", ar: "Muslo", gb: "Chicken Thigh (upper)", us: "Chicken Thigh", pt: "Sobrecoxa", es: "Contramuslo", fr: "Haut de cuisse", it: "Sovracoscia" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn θaɪ/", gb: "/ˈtʃɪk.ɪn θaɪ/", br: "/so.bɾeˈko.ʃɐ/", pt: "/so.bɾɨˈko.ʃɐ/", es: "/kontɾaˈmuslo/", cl: "/ˈtɾutɾo ˈkoɾto/", ar: "/ˈmuslo/", fr: "/o də kɥis/", it: "/sovraˈkɔʃ.ʃa/" } 
      },
      { 
        source_term: "Asa de Frango", image: "", gender_pt: "f", 
        translations: { cl: "Alita de pollo", ar: "Alita de pollo", gb: "Chicken Wing", us: "Chicken Wing", pt: "Asa de frango", es: "Alita de pollo", fr: "Aile de poulet", it: "Ala di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn wɪŋ/", gb: "/ˈtʃɪk.ɪn wɪŋ/", br: "/ˈa.zɐ dʒi ˈfɾɐ̃.ɡu/", pt: "/ˈa.zɐ dɨ ˈfɾɐ̃.ɡu/", es: "/aˈlita ðe ˈpoʎo/", cl: "/aˈlita ðe ˈpoʝo/", ar: "/aˈlita ðe ˈpoʃo/", fr: "/ɛl də pu.lɛ/", it: "/ˈa.la di ˈpol.lo/" } 
      },
      { 
        source_term: "Frango Inteiro", image: "", gender_pt: "m", 
        translations: { cl: "Pollo entero", ar: "Pollo entero", gb: "Whole Chicken", us: "Whole Chicken", pt: "Frango inteiro", es: "Pollo entero", fr: "Poulet entier", it: "Pollo intero" }, 
        phonetics: { us: "/hoʊl ˈtʃɪk.ɪn/", gb: "/həʊl ˈtʃɪk.ɪn/", br: "/ˈfɾɐ̃.ɡu ĩˈtejk.ɾu/", pt: "/ˈfɾɐ̃.ɡu ĩˈtɐj.ɾu/", es: "/ˈpoʎo enˈteɾo/", cl: "/ˈpoʝo enˈteɾo/", ar: "/ˈpoʃo enˈteɾo/", fr: "/pu.lɛ ɑ̃.tje/", it: "/ˈpol.lo inˈtɛ.ro/" } 
      },
      { 
        source_term: "Ovo", image: "", gender_pt: "m", 
        translations: { cl: "Huevo", ar: "Huevo", gb: "Egg", us: "Egg", pt: "Ovo", es: "Huevo", fr: "Oeuf", it: "Uovo" }, 
        phonetics: { us: "/ɛɡ/", gb: "/ɛɡ/", br: "/ˈo.vu/", pt: "/ˈo.vu/", es: "/ˈwweβo/", cl: "/ˈwweβo/", ar: "/ˈwweβo/", fr: "/œf/", it: "/ˈwɔ.vo/" } 
      },
      { 
        source_term: "Coração de Frango", image: "", gender_pt: "m", 
        translations: { cl: "Corazón de pollo", ar: "Corazoncitos", gb: "Chicken Hearts", us: "Chicken Hearts", pt: "Coração de frango", es: "Corazones de pollo", fr: "Cœurs de poulet", it: "Cuori di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn hɑːrts/", gb: "/ˈtʃɪk.ɪn hɑːts/", br: "/ko.ɾaˈsɐ̃w dʒi ˈfɾɐ̃.ɡu/", pt: "/ku.ɾɐˈsɐ̃w dɨ ˈfɾɐ̃.ɡu/", es: "/koɾaˈθones ðe ˈpoʎo/", cl: "/koɾaˈsones ðe ˈpoʝo/", ar: "/koɾasonˈsitos/", fr: "/kœʁ də pu.lɛ/", it: "/ˈkwɔ.ri di ˈpol.lo/" } 
      },
      { 
        source_term: "Fígado de Frango", image: "", gender_pt: "m", 
        translations: { cl: "Hígado de pollo", ar: "Hígado de pollo", gb: "Chicken Liver", us: "Chicken Liver", pt: "Fígado de frango", es: "Hígado de pollo", fr: "Foie de volaille", it: "Fegatini di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn ˈlɪv.ər/", gb: "/ˈtʃɪk.ɪn ˈlɪv.ə/", br: "/ˈfi.ɡa.du dʒi ˈfɾɐ̃.ɡu/", pt: "/ˈfi.ɡɐ.du dɨ ˈfɾɐ̃.ɡu/", es: "/ˈiɣaða ðe ˈpoʎo/", cl: "/ˈiɣaða ðe ˈpoʝo/", ar: "/ˈiɣaða ðe ˈpoʃo/", fr: "/fwa də vɔ.laj/", it: "/feɡaˈti.ni di ˈpol.lo/" } 
      },
      { 
        source_term: "Filé de Frango Empanado", image: "", gender_pt: "m", 
        translations: { cl: "Milanesa de pollo", ar: "Milanesa de pollo", gb: "Breaded Chicken", us: "Chicken Cutlet", pt: "Panados de frango", es: "Pechuga empanada", fr: "Escalope milanaise", it: "Cotoletta di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn ˈkʌt.lət/", gb: "/ˈbrɛd.ɪd ˈtʃɪk.ɪn/", br: "/fiˈlɛ dʒi ˈfɾɐ̃.ɡu ẽ.paˈna.du/", pt: "/pɐˈna.duʃ dɨ ˈfɾɐ̃.ɡu/", es: "/peˈtʃuɣa empaˈnaða/", cl: "/milaˈnesa ðe ˈpoʝo/", ar: "/milaˈnesa ðe ˈpoʃo/", fr: "/ɛs.ka.lɔp mi.la.nɛz/", it: "/kotoˈlet.ta di ˈpol.lo/" } 
      },
      { 
        source_term: "Nuggets", image: "", gender_pt: "m", 
        translations: { cl: "Nuggets", ar: "Patitas", gb: "Chicken Nuggets", us: "Chicken Nuggets", pt: "Nuggets", es: "Nuggets", fr: "Nuggets", it: "Nuggets" }, 
        phonetics: { us: "/ˈnʌɡ.ɪts/", gb: "/ˈnʌɡ.ɪts/", br: "/ˈnɐ.ɡets/", pt: "/ˈnɐ.ɡets/", es: "/ˈnaɣets/", cl: "/ˈnaɣets/", ar: "/paˈtitas/", fr: "/nœ.ɡɛts/", it: "/ˈnaɡ.ɡets/" } 
      },
      { 
        source_term: "Peru", image: "", gender_pt: "m", 
        translations: { cl: "Pavo", ar: "Pavo", gb: "Turkey", us: "Turkey", pt: "Peru", es: "Pavo", fr: "Dinde", it: "Tacchino" }, 
        phonetics: { us: "/ˈtɜːr.ki/", gb: "/ˈtɜː.ki/", br: "/peˈɾu/", pt: "/pɨˈɾu/", es: "/ˈpaβo/", cl: "/ˈpaβo/", ar: "/ˈpaβo/", fr: "/dɛ̃d/", it: "/takˈki.no/" } 
      },
      { 
        source_term: "Pato", image: "", gender_pt: "m", 
        translations: { cl: "Pato", ar: "Pato", gb: "Duck", us: "Duck", pt: "Pato", es: "Pato", fr: "Canard", it: "Anatra" }, 
        phonetics: { us: "/dʌk/", gb: "/dʌk/", br: "/ˈpa.tu/", pt: "/ˈpa.tu/", es: "/ˈpato/", cl: "/ˈpato/", ar: "/ˈpato/", fr: "/ka.naʁ/", it: "/ˈa.na.tra/" } 
      },
      { 
        source_term: "Sassami", image: "", gender_pt: "m", 
        translations: { cl: "Filetillo de pollo", ar: "Suprema de pollo", gb: "Chicken Tenderloin", us: "Chicken Tenderloin", pt: "Lombinho de frango", es: "Solomillo de pollo", fr: "Aiguillette de poulet", it: "Filetto di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn ˈtɛn.dər.lɔɪn/", gb: "/ˈtʃɪk.ɪn ˈtɛn.də.lɔɪn/", br: "/saˈsɐ̃.mi/", pt: "/lõˈbi.ɲu dɨ ˈfɾɐ̃.ɡu/", es: "/soloˈmiʎo ðe ˈpoʎo/", cl: "/fileˈtiʝo ðe ˈpoʝo/", ar: "/suˈpɾema ðe ˈpoʃo/", fr: "/e.ɡɥi.jɛt də pu.lɛ/", it: "/fiˈlet.to di ˈpol.lo/" } 
      },
      { 
        source_term: "Moela", image: "", gender_pt: "f", 
        translations: { cl: "Molleja", ar: "Molleja", gb: "Gizzard", us: "Gizzard", pt: "Moela", es: "Molleja", fr: "Gésier", it: "Ventriglio" }, 
        phonetics: { us: "/ˈɡɪz.ərd/", gb: "/ˈɡɪz.əd/", br: "/moˈɛ.lɐ/", pt: "/muˈɛ.lɐ/", es: "/moˈʎexa/", cl: "/moˈʝexa/", ar: "/moˈʃexa/", fr: "/ʒe.zje/", it: "/venˈtriʎ.ʎo/" } 
      },
      { 
        source_term: "Pescoço", image: "", gender_pt: "m", 
        translations: { cl: "Cogote", ar: "Cogote", gb: "Neck", us: "Neck", pt: "Pescoço", es: "Cuello", fr: "Cou", it: "Collo" }, 
        phonetics: { us: "/nɛk/", gb: "/nɛk/", br: "/pesˈko.su/", pt: "/pɨʃˈko.su/", es: "/ˈkweʎo/", cl: "/koˈɣote/", ar: "/koˈɣote/", fr: "/ku/", it: "/ˈkɔl.lo/" } 
      },
      { 
        source_term: "Frango a Passarinho", image: "", gender_pt: "m", 
        translations: { cl: "Pollo trozado", ar: "Pollo trozado", gb: "Diced Chicken", us: "Chicken Pieces", pt: "Frango aos pedaços", es: "Pollo troceado", fr: "Poulet en morceaux", it: "Pollo a pezzi" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn ˈpiːsɪz/", gb: "/daɪst ˈtʃɪk.ɪn/", br: "/ˈfɾɐ̃.ɡu a pa.saˈɾĩ.ɲu/", pt: "/ˈfɾɐ̃.ɡu awʃ pɨˈda.suʃ/", es: "/ˈpoʎo tɾoθeˈaðo/", cl: "/ˈpoʝo tɾoˈsaðo/", ar: "/ˈpoʃo tɾoˈsaðo/", fr: "/pu.lɛ ɑ̃ mɔʁ.so/", it: "/ˈpol.lo a ˈpet.tsi/" } 
      },
      { 
        source_term: "Tulipa (Asa)", image: "", gender_pt: "f", 
        translations: { cl: "Trutro de ala", ar: "Ala media", gb: "Wingette", us: "Wingette", pt: "Meio da asa", es: "Alerón", fr: "Manchon", it: "Aletta" }, 
        phonetics: { us: "/wɪŋˈɛt/", gb: "/wɪŋˈɛt/", br: "/tuˈli.pɐ/", pt: "/ˈmɐj.u dɐ ˈa.zɐ/", es: "/aleˈɾon/", cl: "/ˈtɾutɾo ðe ˈala/", ar: "/ˈala ˈmeðja/", fr: "/mɑ̃.ʃɔ̃/", it: "/aˈlet.ta/" } 
      },
      { 
        source_term: "Codorna", image: "", gender_pt: "f", 
        translations: { cl: "Codorniz", ar: "Codorniz", gb: "Quail", us: "Quail", pt: "Codorniz", es: "Codorniz", fr: "Caille", it: "Quaglia" }, 
        phonetics: { us: "/kweɪl/", gb: "/kweɪl/", br: "/koˈdɔʁ.nɐ/", pt: "/ku.duɾˈniz/", es: "/koðoɾˈniθ/", cl: "/koðoɾˈnis/", ar: "/koðoɾˈnis/", fr: "/kaj/", it: "/ˈkwaʎ.ʎa/" } 
      },
      { 
        source_term: "Galinha Caipira", image: "", gender_pt: "f", 
        translations: { cl: "Gallina de campo", ar: "Gallina de campo", gb: "Free-range Chicken", us: "Free-range Chicken", pt: "Galinha do campo", es: "Pollo de corral", fr: "Poulet fermier", it: "Pollo ruspante" }, 
        phonetics: { us: "/friː reɪndʒ ˈtʃɪk.ɪn/", gb: "/friː reɪndʒ ˈtʃɪk.ɪn/", br: "/ɡaˈlĩ.ɲɐ kajˈpi.ɾɐ/", pt: "/ɡɐˈli.ɲɐ du ˈkɐ̃.pu/", es: "/ˈpoʎo ðe koˈral/", cl: "/ɡaˈʝina ðe ˈkampo/", ar: "/ɡaˈʃina ðe ˈkampo/", fr: "/pu.lɛ fɛʁ.mje/", it: "/ˈpol.lo rusˈpan.te/" } 
      },
      { 
        source_term: "Chester", image: "", gender_pt: "m", 
        translations: { cl: "Pavo grande", ar: "Pollo grande", gb: "Large Chicken", us: "Roaster Chicken", pt: "Frango grande", es: "Pollo grande", fr: "Gros poulet", it: "Pollo grande" }, 
        phonetics: { us: "/ˈroʊ.stər ˈtʃɪk.ɪn/", gb: "/lɑːdʒ ˈtʃɪk.ɪn/", br: "/ˈʃɛs.tɛʁ/", pt: "/ˈfɾɐ̃.ɡu ˈɡɾɐ̃.dɨ/", es: "/ˈpoʎo ˈɣɾande/", cl: "/ˈpaβo ˈɣɾande/", ar: "/ˈpoʃo ˈɣɾande/", fr: "/ɡʁo pu.lɛ/", it: "/ˈpol.lo ˈɡran.de/" } 
      },
      { 
        source_term: "Carcaça", image: "", gender_pt: "f", 
        translations: { cl: "Carcasa", ar: "Carcasa", gb: "Carcass", us: "Carcass", pt: "Carcaça", es: "Carcasa", fr: "Carcasse", it: "Carcassa" }, 
        phonetics: { us: "/ˈkɑːr.kəs/", gb: "/ˈkɑː.kəs/", br: "/kaʁˈka.sɐ/", pt: "/kɐɾˈka.sɐ/", es: "/kaɾˈkasa/", cl: "/kaɾˈkasa/", ar: "/kaɾˈkasa/", fr: "/kaʁ.kas/", it: "/karˈkas.sa/" } 
      },
      { 
        source_term: "Coxinha da Asa", image: "", gender_pt: "f", 
        translations: { cl: "Trutro de ala", ar: "Muslito de ala", gb: "Drumette", us: "Drumette", pt: "Coxinha da asa", es: "Muslito de ala", fr: "Pilon d'aile", it: "Fuso dell'ala" }, 
        phonetics: { us: "/drʌˈmɛt/", gb: "/drʌˈmɛt/", br: "/koˈʃĩ.ɲɐ da ˈa.zɐ/", pt: "/kuˈʃi.ɲɐ dɐ ˈa.zɐ/", es: "/musˈlito ðe ˈala/", cl: "/ˈtɾutɾo ðe ˈala/", ar: "/musˈlito ðe ˈala/", fr: "/pi.lɔ̃ dɛl/", it: "/ˈfu.zo delˈla.la/" } 
      },
      { 
        source_term: "Fajitas de Frango", image: "", gender_pt: "f", 
        translations: { cl: "Fajitas de pollo", ar: "Fajitas de pollo", gb: "Chicken Fajitas", us: "Chicken Fajitas", pt: "Tiras de frango", es: "Tiras de pollo", fr: "Emincés de poulet", it: "Straccetti di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn fəˈhiː.təz/", gb: "/ˈtʃɪk.ɪn fəˈhiː.təz/", br: "/faˈxi.tas dʒi ˈfɾɐ̃.ɡu/", pt: "/ˈti.ɾɐʃ dɨ ˈfɾɐ̃.ɡu/", es: "/ˈtiɾas ðe ˈpoʎo/", cl: "/faˈxitas ðe ˈpoʝo/", ar: "/faˈxitas ðe ˈpoʃo/", fr: "/e.mɛ̃.se də pu.lɛ/", it: "/stratˈtʃet.ti di ˈpol.lo/" } 
      },
      { 
        source_term: "Espetinho de Frango", image: "", gender_pt: "m", 
        translations: { cl: "Brocheta de pollo", ar: "Brochette de pollo", gb: "Chicken Skewer", us: "Chicken Kebab", pt: "Espetada de frango", es: "Brocheta de pollo", fr: "Brochette de poulet", it: "Spiedino di pollo" }, 
        phonetics: { us: "/ˈtʃɪk.ɪn kɪˈbɑːb/", gb: "/ˈtʃɪk.ɪn ˈskjuː.ə/", br: "/is.peˈtʃĩ.ɲu dʒi ˈfɾɐ̃.ɡu/", pt: "/ɨʃ.pɨˈta.dɐ dɨ ˈfɾɐ̃.ɡu/", es: "/bɾoˈtʃeta ðe ˈpoʎo/", cl: "/bɾoˈtʃeta ðe ˈpoʝo/", ar: "/bɾoˈʃet ðe ˈpoʃo/", fr: "/bʁɔ.ʃɛt də pu.lɛ/", it: "/spjeˈdi.no di ˈpol.lo/" } 
      },
      { 
        source_term: "Frango Desfiado", image: "", gender_pt: "m", 
        translations: { cl: "Pollo desmenuzado", ar: "Pollo desmenuzado", gb: "Shredded Chicken", us: "Pulled Chicken", pt: "Frango desfiado", es: "Pollo desmechado", fr: "Poulet effiloché", it: "Pollo sfilacciato" }, 
        phonetics: { us: "/pʊld ˈtʃɪk.ɪn/", gb: "/ˈʃrɛd.ɪd ˈtʃɪk.ɪn/", br: "/ˈfɾɐ̃.ɡu des.fiˈa.du/", pt: "/ˈfɾɐ̃.ɡu dɨʃ.fiˈa.du/", es: "/ˈpoʎo dezmeˈtʃaðo/", cl: "/ˈpoʝo desmenuˈsaðo/", ar: "/ˈpoʃo desmenuˈsaðo/", fr: "/pu.lɛ e.fi.lɔ.ʃe/", it: "/ˈpol.lo sfilatˈtʃa.to/" } 
      },
  ],
  fish: [
      { 
        source_term: "Salmão", image: "", gender_pt: "m", 
        translations: { cl: "Salmón", ar: "Salmón", gb: "Salmon", us: "Salmon", pt: "Salmão", es: "Salmón", fr: "Saumon", it: "Salmone" }, 
        phonetics: { us: "/ˈsæm.ən/", gb: "/ˈsæm.ən/", br: "/sawˈmɐ̃w/", pt: "/saɫˈmɐ̃w/", es: "/salˈmon/", cl: "/salˈmon/", ar: "/salˈmon/", fr: "/so.mɔ̃/", it: "/salˈmo.ne/" } 
      },
      { 
        source_term: "Atum", image: "", gender_pt: "m", 
        translations: { cl: "Atún", ar: "Atún", gb: "Tuna", us: "Tuna", pt: "Atum", es: "Atún", fr: "Thon", it: "Tonno" }, 
        phonetics: { us: "/ˈtuː.nə/", gb: "/ˈtuː.nə/", br: "/aˈtũ/", pt: "/ɐˈtũ/", es: "/aˈtun/", cl: "/aˈtun/", ar: "/aˈtun/", fr: "/tɔ̃/", it: "/ˈtɔn.no/" } 
      },
      { 
        source_term: "Bacalhau", image: "", gender_pt: "m", 
        translations: { cl: "Bacalao", ar: "Bacalao", gb: "Cod", us: "Cod", pt: "Bacalhau", es: "Bacalao", fr: "Morue", it: "Merluzzo" }, 
        phonetics: { us: "/kɑːd/", gb: "/kɒd/", br: "/ba.kaˈʎaw/", pt: "/bɐ.kɐˈʎaw/", es: "/bakaˈlao/", cl: "/bakaˈlao/", ar: "/bakaˈlao/", fr: "/mɔ.ʁy/", it: "/merˈlut.tso/" } 
      },
      { 
        source_term: "Camarão", image: "", gender_pt: "m", 
        translations: { cl: "Camarón", ar: "Langostino/Camarón", gb: "Prawn", us: "Shrimp", pt: "Camarão", es: "Gamba/Langostino", fr: "Crevette", it: "Gamberetto" }, 
        phonetics: { us: "/ʃrɪmp/", gb: "/prɔːn/", br: "/ka.maˈɾɐ̃w/", pt: "/kɐ.mɐˈɾɐ̃w/", es: "/ˈɡamba/", cl: "/kamaˈɾon/", ar: "/kaŋˈɡɾexo/", fr: "/kʁə.vɛt/", it: "/ɡambeˈret.to/" } 
      },
      { 
        source_term: "Merluza", image: "", gender_pt: "f", 
        translations: { cl: "Merluza", ar: "Merluza", gb: "Hake", us: "Hake", pt: "Pescada", es: "Merluza", fr: "Merlu", it: "Nasello" }, 
        phonetics: { us: "/heɪk/", gb: "/heɪk/", br: "/meʁˈlu.zɐ/", pt: "/pɨʃˈka.dɐ/", es: "/meɾˈluθa/", cl: "/meɾˈlusa/", ar: "/meɾˈlusa/", fr: "/mɛʁ.ly/", it: "/naˈzɛl.lo/" } 
      },
      { 
        source_term: "Tilápia", image: "", gender_pt: "f", 
        translations: { cl: "Tilapia", ar: "Tilapia", gb: "Tilapia", us: "Tilapia", pt: "Tilápia", es: "Tilapia", fr: "Tilapia", it: "Tilapia" }, 
        phonetics: { us: "/tɪˈlɑː.pi.ə/", gb: "/tɪˈlæp.i.ə/", br: "/tʃiˈla.pjɐ/", pt: "/tiˈla.pjɐ/", es: "/tiˈlapja/", cl: "/tiˈlapja/", ar: "/tiˈlapja/", fr: "/ti.la.pja/", it: "/tiˈla.pja/" } 
      },
      { 
        source_term: "Sardinha", image: "", gender_pt: "f", 
        translations: { cl: "Sardina", ar: "Sardina", gb: "Sardine", us: "Sardine", pt: "Sardinha", es: "Sardina", fr: "Sardine", it: "Sardina" }, 
        phonetics: { us: "/sɑːrˈdiːn/", gb: "/ˌsɑːˈdiːn/", br: "/saʁˈdʒĩ.ɲɐ/", pt: "/sɐɾˈdi.ɲɐ/", es: "/saɾˈðina/", cl: "/saɾˈðina/", ar: "/saɾˈðina/", fr: "/saʁ.din/", it: "/sarˈdi.na/" } 
      },
      { 
        source_term: "Truta", image: "", gender_pt: "f", 
        translations: { cl: "Trucha", ar: "Trucha", gb: "Trout", us: "Trout", pt: "Truta", es: "Trucha", fr: "Truite", it: "Trota" }, 
        phonetics: { us: "/traʊt/", gb: "/traʊt/", br: "/ˈtɾu.tɐ/", pt: "/ˈtɾu.tɐ/", es: "/ˈtɾutʃa/", cl: "/ˈtɾutʃa/", ar: "/ˈtɾutʃa/", fr: "/tʁɥit/", it: "/ˈtrɔ.ta/" } 
      },
      { 
        source_term: "Lula", image: "", gender_pt: "f", 
        translations: { cl: "Calamar", ar: "Calamar", gb: "Squid", us: "Calamari", pt: "Lula", es: "Calamar", fr: "Calamar", it: "Calamaro" }, 
        phonetics: { us: "/ˌkæl.əˈmɑːr.i/", gb: "/skwɪd/", br: "/ˈlu.lɐ/", pt: "/ˈlu.lɐ/", es: "/kalaˈmaɾ/", cl: "/kalaˈmaɾ/", ar: "/kalaˈmaɾ/", fr: "/ka.la.maʁ/", it: "/kalaˈma.ro/" } 
      },
      { 
        source_term: "Polvo", image: "", gender_pt: "m", 
        translations: { cl: "Pulpo", ar: "Pulpo", gb: "Octopus", us: "Octopus", pt: "Polvo", es: "Pulpo", fr: "Poulpe", it: "Polpo" }, 
        phonetics: { us: "/ˈɑːk.tə.pəs/", gb: "/ˈɒk.tə.pəs/", br: "/ˈpow.vu/", pt: "/ˈpoɫ.vu/", es: "/ˈpulpo/", cl: "/ˈpulpo/", ar: "/ˈpulpo/", fr: "/pulp/", it: "/ˈpɔl.po/" } 
      },
      { 
        source_term: "Mexilhão", image: "", gender_pt: "m", 
        translations: { cl: "Chorito", ar: "Mejillón", gb: "Mussel", us: "Mussel", pt: "Mexilhão", es: "Mejillón", fr: "Moule", it: "Cozza" }, 
        phonetics: { us: "/ˈmʌs.əl/", gb: "/ˈmʌs.əl/", br: "/me.ʃiˈʎɐ̃w/", pt: "/mɨ.ʃiˈʎɐ̃w/", es: "/mexiˈʎon/", cl: "/tʃoˈɾito/", ar: "/mexiˈʃon/", fr: "/mul/", it: "/ˈkɔt.tsa/" } 
      },
      { 
        source_term: "Ostra", image: "", gender_pt: "f", 
        translations: { cl: "Ostra", ar: "Ostra", gb: "Oyster", us: "Oyster", pt: "Ostra", es: "Ostra", fr: "Huître", it: "Ostrica" }, 
        phonetics: { us: "/ˈɔɪ.stər/", gb: "/ˈɔɪ.stə/", br: "/ˈos.tɾɐ/", pt: "/ˈoʃ.tɾɐ/", es: "/ˈostɾa/", cl: "/ˈostɾa/", ar: "/ˈostɾa/", fr: "/ɥitʁ/", it: "/ˈɔ.stri.ka/" } 
      },
      { 
        source_term: "Lagosta", image: "", gender_pt: "f", 
        translations: { cl: "Langosta", ar: "Langosta", gb: "Lobster", us: "Lobster", pt: "Lagosta", es: "Langosta", fr: "Homard", it: "Aragosta" }, 
        phonetics: { us: "/ˈlɑːb.stər/", gb: "/ˈlɒb.stə/", br: "/laˈɡos.tɐ/", pt: "/lɐˈɡoʃ.tɐ/", es: "/laŋˈɡosta/", cl: "/laŋˈɡosta/", ar: "/laŋˈɡosta/", fr: "/ɔ.maʁ/", it: "/araˈɡo.sta/" } 
      },
      { 
        source_term: "Caranguejo", image: "", gender_pt: "m", 
        translations: { cl: "Jaiba", ar: "Cangrejo", gb: "Crab", us: "Crab", pt: "Caranguejo", es: "Cangrejo", fr: "Crabe", it: "Granchio" }, 
        phonetics: { us: "/kræb/", gb: "/kræb/", br: "/ka.ɾɐ̃ˈɡe.ʒu/", pt: "/kɐ.ɾɐ̃ˈɡe.ʒu/", es: "/kaŋˈɡɾexo/", cl: "/ˈxaiβa/", ar: "/kaŋˈɡɾexo/", fr: "/kʁab/", it: "/ˈɡran.kjo/" } 
      },
      { 
        source_term: "Peixe-espada", image: "", gender_pt: "m", 
        translations: { cl: "Albacora", ar: "Pez espada", gb: "Swordfish", us: "Swordfish", pt: "Peixe-espada", es: "Pez espada", fr: "Espadon", it: "Pesce spada" }, 
        phonetics: { us: "/ˈsɔːrd.fɪʃ/", gb: "/ˈsɔːd.fɪʃ/", br: "/ˈpej.ʃi isˈpa.dɐ/", pt: "/ˈpɐj.ʃɨ ʃˈpa.dɐ/", es: "/peθ esˈpaða/", cl: "/peˈs esˈpaða/", ar: "/peˈs esˈpaða/", fr: "/ɛs.pa.dɔ̃/", it: "/ˈpeʃ.ʃe ˈspa.da/" } 
      },
      { 
        source_term: "Linguado", image: "", gender_pt: "m", 
        translations: { cl: "Lenguado", ar: "Lenguado", gb: "Sole", us: "Flounder", pt: "Linguado", es: "Lenguado", fr: "Sole", it: "Sogliola" }, 
        phonetics: { us: "/ˈflaʊn.dər/", gb: "/səʊl/", br: "/lĩˈɡwa.du/", pt: "/lĩˈɡwa.du/", es: "/leŋˈɡwaðo/", cl: "/leŋˈɡwaðo/", ar: "/leŋˈɡwaðo/", fr: "/sɔl/", it: "/ˈsɔʎ.ʎo.la/" } 
      },
      { 
        source_term: "Corvina", image: "", gender_pt: "f", 
        translations: { cl: "Corvina", ar: "Corvina", gb: "Sea Bass", us: "Croaker", pt: "Corvina", es: "Corvina", fr: "Maigre", it: "Ombrina" }, 
        phonetics: { us: "/ˈkroʊ.kər/", gb: "/siː bæs/", br: "/koʁˈvi.nɐ/", pt: "/kuɾˈvi.nɐ/", es: "/koɾˈβina/", cl: "/koɾˈβina/", ar: "/koɾˈβina/", fr: "/mɛɡʁ/", it: "/omˈbri.na/" } 
      },
      { 
        source_term: "Reineta", image: "", gender_pt: "f", 
        translations: { cl: "Reineta", ar: "Reineta", gb: "Pomfret", us: "Pomfret", pt: "Xaputa", es: "Japuta", fr: "Castagnole", it: "Castagna di mare" }, 
        phonetics: { us: "/ˈpɑːm.frət/", gb: "/ˈpɒm.frət/", br: "/xejˈne.tɐ/", pt: "/ʃɐˈpu.tɐ/", es: "/xaˈputa/", cl: "/reiˈneta/", ar: "/reiˈneta/", fr: "/kas.ta.ɲɔl/", it: "/kasˈtaɲ.ɲa di ˈma.re/" } 
      },
      { 
        source_term: "Vieira", image: "", gender_pt: "f", 
        translations: { cl: "Ostión", ar: "Vieira", gb: "Scallop", us: "Scallop", pt: "Vieira", es: "Vieira", fr: "Coquille Saint-Jacques", it: "Capasanta" }, 
        phonetics: { us: "/ˈskæ.ləp/", gb: "/ˈskɒl.əp/", br: "/viˈej.ɾɐ/", pt: "/viˈɐj.ɾɐ/", es: "/ˈbjeiɾa/", cl: "/osˈtjon/", ar: "/ˈbjeiɾa/", fr: "/kɔ.kij sɛ̃.ʒak/", it: "/kapaˈsan.ta/" } 
      },
      { 
        source_term: "Ourice", image: "", gender_pt: "m", 
        translations: { cl: "Erizo", ar: "Erizo de mar", gb: "Sea Urchin", us: "Sea Urchin", pt: "Ouriço-do-mar", es: "Erizo de mar", fr: "Oursin", it: "Riccio di mare" }, 
        phonetics: { us: "/siː ˈɜːr.tʃɪn/", gb: "/siː ˈɜː.tʃɪn/", br: "/owˈɾi.su/", pt: "/owˈɾi.su/", es: "/eˈɾiθo/", cl: "/eˈɾiso/", ar: "/eˈɾiso/", fr: "/uʁ.sɛ̃/", it: "/ˈrit.tʃo/" } 
      },
      { 
        source_term: "Amêijoa", image: "", gender_pt: "f", 
        translations: { cl: "Almeja", ar: "Almeja", gb: "Clam", us: "Clam", pt: "Amêijoa", es: "Almeja", fr: "Palourde", it: "Vongola" }, 
        phonetics: { us: "/klæm/", gb: "/klæm/", br: "/aˈmej.ʒwɐ/", pt: "/ɐˈmɐj.ʒwɐ/", es: "/alˈmexa/", cl: "/alˈmexa/", ar: "/alˈmexa/", fr: "/pa.luʁd/", it: "/ˈvoŋ.ɡo.la/" } 
      },
      { 
        source_term: "Cavala", image: "", gender_pt: "f", 
        translations: { cl: "Caballa", ar: "Caballa", gb: "Mackerel", us: "Mackerel", pt: "Cavala", es: "Caballa", fr: "Maquereau", it: "Sgombro" }, 
        phonetics: { us: "/ˈmæk.rəl/", gb: "/ˈmæk.rəl/", br: "/kaˈva.lɐ/", pt: "/kɐˈva.lɐ/", es: "/kaˈβaʎa/", cl: "/kaˈβaʝa/", ar: "/kaˈβaʃa/", fr: "/ma.kʁo/", it: "/ˈzɡom.bro/" } 
      },
      { 
        source_term: "Dourada", image: "", gender_pt: "f", 
        translations: { cl: "Dorado", ar: "Dorado", gb: "Sea Bream", us: "Sea Bream", pt: "Dourada", es: "Dorada", fr: "Daurade", it: "Orata" }, 
        phonetics: { us: "/siː briːm/", gb: "/siː briːm/", br: "/dowˈɾa.dɐ/", pt: "/doˈɾa.dɐ/", es: "/doˈɾaða/", cl: "/doˈɾaðo/", ar: "/doˈɾaðo/", fr: "/dɔ.ʁad/", it: "/oˈra.ta/" } 
      },
      { 
        source_term: "Robalo", image: "", gender_pt: "m", 
        translations: { cl: "Róbalo", ar: "Róbalo", gb: "Sea Bass", us: "Sea Bass", pt: "Robalo", es: "Lubina", fr: "Bar", it: "Spigola" }, 
        phonetics: { us: "/siː bæs/", gb: "/siː bæs/", br: "/ʁoˈba.lu/", pt: "/ʁuˈba.lu/", es: "/luˈβina/", cl: "/ˈroβalo/", ar: "/ˈroβalo/", fr: "/baʁ/", it: "/ˈspi.ɡo.la/" } 
      },
      { 
        source_term: "Anchova", image: "", gender_pt: "f", 
        translations: { cl: "Anchoa", ar: "Anchoa", gb: "Anchovy", us: "Anchovy", pt: "Anchova", es: "Anchoa", fr: "Anchois", it: "Acciuga" }, 
        phonetics: { us: "/ˈæn.tʃoʊ.vi/", gb: "/ˈæn.tʃə.vi/", br: "/ɐ̃ˈʃo.vɐ/", pt: "/ɐ̃ˈʃo.vɐ/", es: "/anˈtʃoa/", cl: "/anˈtʃoa/", ar: "/anˈtʃoa/", fr: "/ɑ̃.ʃwa/", it: "/atˈtʃu.ɡa/" } 
      },
  ]
};
