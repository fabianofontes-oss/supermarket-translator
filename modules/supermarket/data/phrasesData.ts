

export const phrasesData: Record<string, { source_term: string; image: string; gender_pt: 'm' | 'f'; translations: Record<string, string>; phonetics?: Record<string, string> }[]> = {
  findingItems: [
    { 
      source_term: "Onde fica o leite?", image: "", gender_pt: "m", 
      translations: { cl: "¿Dónde está la leche?", ar: "¿Dónde está la leche?", gb: "Where is the milk?", us: "Where is the milk?", pt: "Onde está o leite?", es: "¿Dónde está la leche?", fr: "Où est le lait ?", it: "Dov'è il latte?" }, 
      phonetics: { us: "/wɛr ɪz ðə mɪlk/", es: "/ˈdonde esˈta la ˈletʃe/", cl: "/ˈdonde esˈta la ˈletʃe/", fr: "/u ɛ lə lɛ/", it: "/doˈvɛ il ˈlatte/", br: "/ˈõ.dʒi ˈfi.kɐ u ˈlej.tʃi/", pt: "/ˈõ.dɨ ʃˈta u ˈlɐj.tɨ/" } 
    },
    { 
      source_term: "Eu procuro...", image: "", gender_pt: "m", 
      translations: { cl: "Busco...", ar: "Estoy buscando...", gb: "I'm looking for...", us: "I'm looking for...", pt: "Estou à procura de...", es: "Estoy buscando...", fr: "Je cherche...", it: "Sto cercando..." }, 
      phonetics: { us: "/aɪm ˈlʊkɪŋ fɔr/", es: "/esˈtoi βusˈkando/", cl: "/ˈbusko/", fr: "/ʒə ʃɛʁʃ/", it: "/stɔ tʃerˈkan.do/", br: "/ew pɾoˈku.ɾu/", pt: "/ʃˈto a pɾuˈku.ɾɐ dɨ/" } 
    },
    { 
      source_term: "Em qual corredor?", image: "", gender_pt: "m", 
      translations: { cl: "¿En qué pasillo?", ar: "¿En qué pasillo?", gb: "Which aisle?", us: "Which aisle?", pt: "Em que corredor?", es: "¿En qué pasillo?", fr: "Dans quel rayon ?", it: "In quale corsia?" }, 
      phonetics: { us: "/wɪtʃ aɪl/", es: "/eŋ ˈke paˈsiʎo/", cl: "/eŋ ˈke paˈsiʝo/", fr: "/dɑ̃ kɛl ʁɛ.jɔ̃/", it: "/iŋ ˈkwa.le korˈsi.a/", br: "/ẽ kwaw ko.heˈdoʁ/", pt: "/ɐ̃j ke ku.ʁɨˈdoɾ/" } 
    },
    { 
      source_term: "Pode me mostrar onde é?", image: "", gender_pt: "m", 
      translations: { cl: "¿Me puede mostrar dónde es?", ar: "¿Me muestra dónde queda?", gb: "Can you show me where it is?", us: "Can you show me where it is?", pt: "Pode mostrar-me onde é?", es: "¿Me puede indicar dónde está?", fr: "Pouvez-vous me montrer où c'est ?", it: "Mi può mostrare dov'è?" }, 
      phonetics: { us: "/kæn ju ʃoʊ mi wɛr ɪt ɪz/", es: "/me ˈpweðe indiˈkaɾ ˈdonde esˈta/", cl: "/me ˈpweðe mostˈɾaɾ ˈdonde es/", fr: "/pu.ve vu mə mɔ̃.tʁe u sɛ/", it: "/mi pwɔ moˈstra.re doˈvɛ/", br: "/ˈpɔ.dʒi mi mosˈtɾaʁ ˈõ.dʒi ɛ/", pt: "/ˈpɔ.dɨ muʃˈtɾaɾ.mɨ ˈõ.dɨ ɛ/" } 
    },
    { 
      source_term: "Você sabe onde eu acho isso?", image: "", gender_pt: "m", 
      translations: { cl: "¿Sabe dónde encuentro esto?", ar: "¿Sabe dónde encuentro esto?", gb: "Do you know where I can find this?", us: "Do you know where I can find this?", pt: "Sabe onde posso encontrar isto?", es: "¿Sabe dónde puedo encontrar esto?", fr: "Savez-vous où je peux trouver ça ?", it: "Sa dove posso trovare questo?" }, 
      phonetics: { us: "/du ju noʊ wɛr aɪ kæn faɪnd ðɪs/", es: "/ˈsaβe ˈdonde ˈpweðo enkontoˈɾaɾ ˈesto/", cl: "/ˈsaβe ˈdonde eŋˈkwentɾo ˈesto/", fr: "/sa.ve vu u ʒə pø tʁu.ve sa/", it: "/sa ˈdo.ve ˈpɔs.so troˈva.re ˈkwe.sto/", br: "/voˈse ˈsa.bi ˈõ.dʒi ew ˈa.ʃu ˈi.su/", pt: "/ˈsa.bɨ ˈõ.dɨ ˈpɔ.su ẽ.kõˈtɾaɾ ˈiʃ.tu/" } 
    },
    { 
      source_term: "Tem alguém pra me orientar?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hay alguien que me oriente?", ar: "¿Alguien me puede ayudar?", gb: "Is there someone to help me?", us: "Is there someone to guide me?", pt: "Tem alguém para me ajudar?", es: "¿Hay alguien que me pueda orientar?", fr: "Y a-t-il quelqu'un pour m'orienter ?", it: "C'è qualcuno che può aiutarmi?" }, 
      phonetics: { us: "/ɪz ðɛr ˈsʌmwʌn tu ɡaɪd mi/", es: "/ai ˈalɣjen ke me ˈpweða oɾjenˈtaɾ/", cl: "/ai ˈalɣjen ke me oˈɾjente/", fr: "/i a til kɛl.kœ̃ puʁ mɔ.ʁjɑ̃.te/", it: "/tʃɛ kwalˈku.no ke pwɔ ajuˈtar.mi/", br: "/tẽj awˈɡẽj pɾa mi o.ɾjẽˈtaʁ/", pt: "/tɐ̃j ɐɫˈɡɐ̃j pɐ.ɾɐ mɨ ɐ.ʒuˈdaɾ/" } 
    },
  ],
  stock: [
    { 
      source_term: "Acabou este item?", image: "", gender_pt: "m", 
      translations: { cl: "¿Se acabó esto?", ar: "¿No queda más?", gb: "Is this out of stock?", us: "Is this out of stock?", pt: "Esgotou este artigo?", es: "¿Se ha agotado?", fr: "Est-ce en rupture de stock ?", it: "È esaurito?" }, 
      phonetics: { us: "/ɪz ðɪs aʊt ʌv stɑːk/", es: "/se a aɣoˈtaðo/", cl: "/se akaˈβo ˈesto/", fr: "/ɛs ɑ̃ ʁyp.tyʁ də stɔk/", it: "/ɛ ezauˈri.to/", br: "/a.kaˈbo es.tʃi ˈi.tẽj/", pt: "/iʒ.ɡoˈto ˈeʃ.tɨ ɐɾˈti.ɡu/" } 
    },
    { 
      source_term: "Tem mais desse aí?", image: "", gender_pt: "m", 
      translations: { cl: "¿Tiene más de esto?", ar: "¿Tienen más de esto?", gb: "Do you have more of this?", us: "Do you have more of this?", pt: "Tem mais deste?", es: "¿Tienen más de esto?", fr: "En avez-vous d'autres ?", it: "Ne avete altri?" }, 
      phonetics: { us: "/du ju hæv mɔːr ʌv ðɪs/", es: "/ˈtjenen mas de ˈesto/", cl: "/ˈtjene mas de ˈesto/", fr: "/ɑ̃ a.ve vu dotʁ/", it: "/ne aˈve.te ˈal.tri/", br: "/tẽj majs ˈde.si aˈi/", pt: "/tɐ̃j majʃ ˈdeʃ.tɨ/" } 
    },
    { 
      source_term: "Vocês vão repor hoje?", image: "", gender_pt: "m", 
      translations: { cl: "¿Van a reponer hoy?", ar: "¿Van a reponer hoy?", gb: "Will you restock today?", us: "Will you restock today?", pt: "Vão repor hoje?", es: "¿Van a reponer hoy?", fr: "Allez-vous réapprovisionner aujourd'hui ?", it: "Rifornirete oggi?" }, 
      phonetics: { us: "/wɪl ju riˈstɑːk təˈdeɪ/", es: "/ban a repoˈneɾ oi/", cl: "/ban a repoˈneɾ oi/", fr: "/a.le vu ʁe.a.pʁɔ.vi.zjɔ.ne o.ʒuʁ.dɥi/", it: "/riforniˈre.te ˈɔd.dʒi/", br: "/voˈses vɐ̃w heˈpoʁ ˈo.ʒi/", pt: "/vɐ̃w ʁɨˈpoɾ ˈo.ʒɨ/" } 
    },
    { 
      source_term: "Tem no estoque ainda?", image: "", gender_pt: "m", 
      translations: { cl: "¿Queda en bodega?", ar: "¿Queda en el depósito?", gb: "Is it still in stock?", us: "Is it still in stock?", pt: "Ainda tem em stock?", es: "¿Queda en el almacén?", fr: "Est-ce encore en stock ?", it: "C'è ancora in magazzino?" }, 
      phonetics: { us: "/ɪz ɪt stɪl ɪn stɑːk/", es: "/ˈkeða en el almaˈθen/", cl: "/ˈkeða em boˈðeɣa/", fr: "/ɛs ɑ̃.kɔʁ ɑ̃ stɔk/", it: "/tʃɛ anˈkɔ.ra im maɡadˈdzi.no/", br: "/tẽj nu esˈtɔ.ki aˈĩ.dɐ/", pt: "/aˈĩ.dɐ tɐ̃j ɐ̃j stɔk/" } 
    },
    { 
      source_term: "Chega mais depois?", image: "", gender_pt: "m", 
      translations: { cl: "¿Llegará más luego?", ar: "¿Llega más tarde?", gb: "Will more arrive later?", us: "Will more arrive later?", pt: "Chega mais depois?", es: "¿Llegará más tarde?", fr: "Est-ce qu'il y en aura plus tard ?", it: "Ne arriveranno altri più tardi?" }, 
      phonetics: { us: "/wɪl mɔːr əˈraɪv ˈleɪtər/", es: "/ʝeɣaˈɾa mas ˈtaɾðe/", cl: "/ʝeɣaˈɾa mas ˈlweɣo/", fr: "/ɛs kil i ɑ̃ o.ʁa ply taʁ/", it: "/ne arriveˈran.no ˈal.tri pju ˈtar.di/", br: "/ˈʃe.ɡɐ majs deˈpojs/", pt: "/ˈʃe.ɡɐ majʃ dɨˈpojʃ/" } 
    },
    { 
      source_term: "Tem outra opção desse?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hay otra opción?", ar: "¿Tienen otra opción?", gb: "Is there another option?", us: "Is there another option?", pt: "Há outra opção?", es: "¿Hay otra opción?", fr: "Y a-t-il une autre option ?", it: "C'è un'altra opzione?" }, 
      phonetics: { us: "/ɪz ðɛr əˈnʌðər ˈɑːpʃən/", es: "/ai ˈotɾa opˈθjon/", cl: "/ai ˈotɾa opˈsjon/", fr: "/i a til yn otʁ ɔp.sjɔ̃/", it: "/tʃɛ unˈal.tra opˈtsjo.ne/", br: "/tẽj ˈow.tɾɐ opˈsɐ̃w ˈde.si/", pt: "/a ˈo.tɾɐ ɔpˈsɐ̃w/" } 
    },
  ],
  prices: [
    { 
      source_term: "Quanto custa?", image: "", gender_pt: "m", 
      translations: { cl: "¿Cuánto cuesta?", ar: "¿Cuánto sale?", gb: "How much is it?", us: "How much is it?", pt: "Quanto custa?", es: "¿Cuánto cuesta?", fr: "Combien ça coûte ?", it: "Quanto costa?" }, 
      phonetics: { us: "/haʊ mʌtʃ ɪz ɪt/", es: "/ˈkwanto ˈkwesta/", cl: "/ˈkwanto ˈkwesta/", fr: "/kɔ̃.bjɛ̃ sa kut/", it: "/ˈkwan.to ˈkɔ.sta/", br: "/ˈkwɐ̃.tu ˈkus.tɐ/", pt: "/ˈkwɐ̃.tu ˈkuʃ.tɐ/" } 
    },
    { 
      source_term: "Esse é o preço mesmo?", image: "", gender_pt: "m", 
      translations: { cl: "¿Es este el precio?", ar: "¿Este es el precio?", gb: "Is this the right price?", us: "Is this the right price?", pt: "Este é o preço mesmo?", es: "¿Es este el precio?", fr: "Est-ce le bon prix ?", it: "È questo il prezzo giusto?" }, 
      phonetics: { us: "/ɪz ðɪs ðə raɪt praɪs/", es: "/es ˈeste el ˈpɾeθjo/", cl: "/es ˈeste el ˈpɾesjo/", fr: "/ɛs lə bɔ̃ pʁi/", it: "/ɛ ˈkwe.sto il ˈpret.tso ˈdʒu.sto/", br: "/ˈe.si ɛ u ˈpɾe.su ˈmez.mu/", pt: "/ˈeʃ.tɨ ɛ u ˈpɾe.su ˈmɛʒ.mu/" } 
    },
    { 
      source_term: "Tem promoção pra isso?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hay oferta?", ar: "¿Está en promoción?", gb: "Is there a promotion?", us: "Is there a promotion?", pt: "Está em promoção?", es: "¿Hay alguna promoción?", fr: "Y a-t-il une promotion ?", it: "C'è una promozione?" }, 
      phonetics: { us: "/ɪz ðɛr ə prəˈmoʊʃən/", es: "/ai alˈɣuna pɾomoˈθjon/", cl: "/ai oˈfeɾta/", fr: "/i a til yn pʁɔ.mɔ.sjɔ̃/", it: "/tʃɛ ˈu.na promotˈtsjo.ne/", br: "/tẽj pɾo.moˈsɐ̃w pɾa ˈi.su/", pt: "/ʃˈta ɐ̃j pɾu.muˈsɐ̃w/" } 
    },
    { 
      source_term: "O preço da prateleira está certo?", image: "", gender_pt: "m", 
      translations: { cl: "¿El precio de la góndola está bien?", ar: "¿El precio de la góndola es correcto?", gb: "Is the shelf price correct?", us: "Is the shelf price correct?", pt: "O preço da prateleira está certo?", es: "¿El precio de la estantería es correcto?", fr: "Le prix en rayon est-il correct ?", it: "Il prezzo sullo scaffale è corretto?" }, 
      phonetics: { us: "/ɪz ðə ʃɛlf praɪs kəˈrɛkt/", es: "/el ˈpɾeθjo ðe la estanteˈɾia es koˈrekto/", cl: "/el ˈpɾesjo ðe la ˈɡondola esˈta bjen/", fr: "/lə pʁi ɑ̃ ʁɛ.jɔ̃ ɛ til kɔ.ʁɛkt/", it: "/il ˈpret.tso ˈsul.lo skafˈfa.le ɛ korˈret.to/", br: "/u ˈpɾe.su da pɾa.teˈlej.ɾɐ esˈta ˈsɛʁ.tu/", pt: "/u ˈpɾe.su dɐ pɾɐ.tɨˈlɐj.ɾɐ ʃˈta ˈsɛɾ.tu/" } 
    },
    { 
      source_term: "No caixa deu outro valor", image: "", gender_pt: "m", 
      translations: { cl: "En la caja salió otro precio", ar: "En la caja dio otro valor", gb: "It rang up differently", us: "It rang up differently", pt: "Na caixa deu outro valor", es: "En la caja dio otro valor", fr: "Ça a affiché un autre prix en caisse", it: "Alla cassa è uscito un altro prezzo" }, 
      phonetics: { us: "/ɪt ræŋ ʌp ˈdɪfrəntli/", es: "/en la ˈkaxa ðjo ˈotɾo βaˈloɾ/", cl: "/en la ˈkaxa saˈljo ˈotɾo ˈpɾesjo/", fr: "/sa a a.fi.ʃe œ̃ otʁ pʁi ɑ̃ kɛs/", it: "/ˈal.la ˈkas.sa ɛ uʃˈʃi.to un ˈal.tro ˈpret.tso/", br: "/nu ˈkaj.ʃɐ dew ˈow.tɾu vaˈloʁ/", pt: "/nɐ ˈkɐj.ʃɐ dew ˈo.tɾu vɐˈloɾ/" } 
    },
    { 
      source_term: "Tem desconto no app?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hay descuento en la app?", ar: "¿Hay descuento con la app?", gb: "Is there an app discount?", us: "Is there an app discount?", pt: "Tem desconto na app?", es: "¿Hay descuento en la app?", fr: "Y a-t-il une réduction sur l'appli ?", it: "C'è uno sconto sull'app?" }, 
      phonetics: { us: "/ɪz ðɛr ən æp ˈdɪskaʊnt/", es: "/ai desˈkwento en la ap/", cl: "/ai desˈkwento en la ap/", fr: "/i a til yn ʁe.dyk.sjɔ̃ syʁ lap.pli/", it: "/tʃɛ ˈu.no ˈskon.to sulˈlap/", br: "/tẽj desˈkõ.tu nu ɛp/", pt: "/tɐ̃j dɨʃˈkõ.tu nɐ ap/" } 
    },
  ],
  checkout: [
    { 
      source_term: "Essa fila é daqui?", image: "", gender_pt: "m", 
      translations: { cl: "¿Esta es la fila?", ar: "¿Esta es la fila?", gb: "Is this the queue?", us: "Is this the line?", pt: "Esta é a fila?", es: "¿Esta es la cola?", fr: "Est-ce la queue ?", it: "È questa la fila?" }, 
      phonetics: { us: "/ɪz ðɪs ðə laɪn/", es: "/ˈesta es la ˈkola/", cl: "/ˈesta es la ˈfila/", fr: "/ɛs la kø/", it: "/ɛ ˈkwe.sta la ˈfi.la/", br: "/ˈɛ.sɐ ˈfi.lɐ ɛ daˈki/", pt: "/ˈeʃ.tɐ ɛ ɐ ˈfi.lɐ/" } 
    },
    { 
      source_term: "O caixa tá aberto?", image: "", gender_pt: "m", 
      translations: { cl: "¿La caja está abierta?", ar: "¿La caja está abierta?", gb: "Is the till open?", us: "Is the register open?", pt: "A caixa está aberta?", es: "¿La caja está abierta?", fr: "La caisse est-elle ouverte ?", it: "La cassa è aperta?" }, 
      phonetics: { us: "/ɪz ðə ˈrɛdʒɪstər ˈoʊpən/", es: "/la ˈkaxa esˈta aˈβjeɾta/", cl: "/la ˈkaxa esˈta aˈβjeɾta/", fr: "/la kɛs ɛ tɛl u.vɛʁt/", it: "/la ˈkas.sa ɛ aˈpɛr.ta/", br: "/u ˈkaj.ʃɐ ta aˈbɛʁ.tu/", pt: "/ɐ ˈkɐj.ʃɐ ʃˈta ɐˈbɛɾ.tɐ/" } 
    },
    { 
      source_term: "Aceita cartão?", image: "", gender_pt: "m", 
      translations: { cl: "¿Acepta tarjeta?", ar: "¿Aceptan tarjeta?", gb: "Do you take card?", us: "Do you take credit cards?", pt: "Aceita cartão?", es: "¿Aceptan tarjeta?", fr: "Acceptez-vous la carte ?", it: "Accettate carte?" }, 
      phonetics: { us: "/du ju teɪk ˈkrɛdɪt kɑːrdz/", es: "/aˈθeptan taɾˈxeta/", cl: "/aˈsepta taɾˈxeta/", fr: "/ak.sɛp.te vu la kaʁt/", it: "/attʃetˈta.te ˈkar.te/", br: "/aˈsej.tɐ kaʁˈtɐ̃w/", pt: "/ɐˈsɐj.tɐ kɐɾˈtɐ̃w/" } 
    },
    { 
      source_term: "Posso pagar por aproximação?", image: "", gender_pt: "m", 
      translations: { cl: "¿Puedo pagar sin contacto?", ar: "¿Puedo pagar con contactless?", gb: "Can I pay contactless?", us: "Can I pay contactless?", pt: "Posso pagar com contactless?", es: "¿Puedo pagar sin contacto?", fr: "Puis-je payer sans contact ?", it: "Posso pagare contactless?" }, 
      phonetics: { us: "/kæn aɪ peɪ ˈkɑːntæktləs/", es: "/ˈpweðo paˈɣaɾ sin konˈtakto/", cl: "/ˈpweðo paˈɣaɾ sin konˈtakto/", fr: "/pɥi ʒə pɛ.je sɑ̃ kɔ̃.takt/", it: "/ˈpɔs.so paˈɡa.re ˈkɔn.takt.les/", br: "/ˈpɔ.su paˈɡaʁ poʁ a.pɾo.si.maˈsɐ̃w/", pt: "/ˈpɔ.su pɐˈɡaɾ kõ ˈkɔn.takt.les/" } 
    },
    { 
      source_term: "Tem self-checkout?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hay autoservicio?", ar: "¿Hay cajas de autoservicio?", gb: "Is there self-checkout?", us: "Is there self-checkout?", pt: "Tem caixas self-service?", es: "¿Hay cajas de autopago?", fr: "Y a-t-il des caisses automatiques ?", it: "C'è la cassa automatica?" }, 
      phonetics: { us: "/ɪz ðɛr sɛlf ˈtʃɛkaʊt/", es: "/ai ˈkaxas ðe autoˈpaɣo/", cl: "/ai autoseɾˈβisjo/", fr: "/i a til de kɛs o.tɔ.ma.tik/", it: "/tʃɛ la ˈkas.sa autoˈma.ti.ka/", br: "/tẽj sɛwf ʃɛˈkawt/", pt: "/tɐ̃j ˈkɐj.ʃɐʃ sɛɫf ˈsɛɾ.vis/" } 
    },
    { 
      source_term: "Crédito ou débito?", image: "", gender_pt: "m", 
      translations: { cl: "¿Crédito o débito?", ar: "¿Crédito o débito?", gb: "Credit or debit?", us: "Credit or debit?", pt: "Crédito ou débito?", es: "¿Crédito o débito?", fr: "Crédit ou débit ?", it: "Credito o debito?" }, 
      phonetics: { us: "/ˈkrɛdɪt ɔːr ˈdɛbɪt/", es: "/ˈkɾeðito o ˈðeβito/", cl: "/ˈkɾeðito o ˈðeβito/", fr: "/kʁe.di u de.bi/", it: "/ˈkre.di.to o ˈde.bi.to/", br: "/ˈkɾɛ.dʒi.tu ow ˈdɛ.bi.tu/", pt: "/ˈkɾɛ.di.tu o ˈdɛ.bi.tu/" } 
    },
    { 
      source_term: "Preciso de uma sacola", image: "", gender_pt: "f", 
      translations: { cl: "Necesito una bolsa", ar: "Necesito una bolsa", gb: "I need a bag", us: "I need a bag", pt: "Preciso de um saco", es: "Necesito una bolsa", fr: "J'ai besoin d'un sac", it: "Ho bisogno di una busta" }, 
      phonetics: { us: "/aɪ nid ə bæɡ/", es: "/neθeˈsito una ˈβolsa/", cl: "/neseˈsito una ˈβolsa/", fr: "/ʒe bə.zwɛ̃ dœ̃ sak/", it: "/ɔ biˈzoɲ.ɲo di ˈu.na ˈbu.sta/", br: "/pɾeˈsi.zu dʒi ˈu.mɐ saˈkɔ.lɐ/", pt: "/pɾɨˈsi.zu dɨ ũ ˈsa.ku/" } 
    },
    { 
      source_term: "Pode me dar o recibo?", image: "", gender_pt: "m", 
      translations: { cl: "¿Me da la boleta?", ar: "¿Me da el ticket?", gb: "Can I have the receipt?", us: "Can I have the receipt?", pt: "Pode dar-me o talão?", es: "¿Me da el recibo?", fr: "Je peux avoir le ticket ?", it: "Posso avere lo scontrino?" }, 
      phonetics: { us: "/kæn aɪ hæv ðə rɪˈsiːt/", es: "/me ða el reˈθiβo/", cl: "/me ða la boˈleta/", fr: "/ʒə pø a.vwaʁ lə ti.kɛ/", it: "/ˈpɔs.so aˈve.re lo skonˈtri.no/", br: "/ˈpɔ.dʒi mi daʁ u heˈsi.bu/", pt: "/ˈpɔ.dɨ ˈdaɾ.mɨ u tɐˈlɐ̃w/" } 
    },
    { 
      source_term: "CPF na nota?", image: "", gender_pt: "m", 
      translations: { cl: "¿Quiere dar su RUT?", ar: "¿DNI?", gb: "Loyalty card?", us: "Membership card?", pt: "Contribuinte na fatura?", es: "¿Quiere factura?", fr: "Carte de fidélité ?", it: "Ha la tessera?" }, 
      phonetics: { us: "/ˈmɛmbərʃɪp kɑːrd/", es: "/ˈkjeɾe fakˈtuɾa/", cl: "/ˈkjeɾe ðaɾ su rut/", fr: "/kaʁt də fi.de.li.te/", it: "/a la ˈtes.se.ra/", br: "/se pe ɛ.fi na ˈnɔ.tɐ/", pt: "/kõ.tɾiˈbwĩ.tɨ nɐ fɐˈtu.ɾɐ/" } 
    },
  ],
  details: [
    { 
      source_term: "Precisa pesar antes?", image: "", gender_pt: "m", 
      translations: { cl: "¿Se pesa antes?", ar: "¿Hay que pesarlo antes?", gb: "Do I need to weigh this?", us: "Do I need to weigh this?", pt: "Precisa de pesar antes?", es: "¿Necesito pesarlo antes?", fr: "Dois-je le peser avant ?", it: "Devo pesarlo prima?" }, 
      phonetics: { us: "/du aɪ nid tu weɪ ðɪs/", es: "/neθeˈsito peˈsaɾlo ˈantes/", cl: "/se ˈpesa ˈantes/", fr: "/dwa ʒə lə pə.ze a.vɑ̃/", it: "/ˈde.vo peˈzar.lo ˈpri.ma/", br: "/pɾeˈsi.za peˈzaʁ ˈɐ̃.tʃis/", pt: "/pɾɨˈsi.zɐ dɨ pɨˈzaɾ ˈɐ̃.tɨʃ/" } 
    },
    { 
      source_term: "É por unidade ou por peso?", image: "", gender_pt: "m", 
      translations: { cl: "¿Es por unidad o por peso?", ar: "¿Es por unidad o por peso?", gb: "Is it per unit or weight?", us: "Is it per unit or weight?", pt: "É à unidade ou ao peso?", es: "¿Es por unidad o por peso?", fr: "C'est à l'unité ou au poids ?", it: "È a unità o a peso?" }, 
      phonetics: { us: "/ɪz ɪt pər ˈjuːnɪt ɔːr weɪt/", es: "/es poɾ uniˈðað o poɾ ˈpeso/", cl: "/es poɾ uniˈðað o poɾ ˈpeso/", fr: "/sɛ a ly.ni.te u o pwa/", it: "/ɛ a uniˈta o a ˈpe.zo/", br: "/ɛ poʁ u.niˈda.dʒi ow poʁ ˈpe.zu/", pt: "/ɛ a u.niˈda.dɨ o aw ˈpe.zu/" } 
    },
    { 
      source_term: "Vocês embalam isso?", image: "", gender_pt: "m", 
      translations: { cl: "¿Lo envuelven?", ar: "¿Lo envuelven?", gb: "Do you wrap this?", us: "Do you wrap this?", pt: "Embrulham isto?", es: "¿Envuelven esto?", fr: "Vous l'emballez ?", it: "Lo incartate?" }, 
      phonetics: { us: "/du ju ræp ðɪs/", es: "/enˈbwelβen ˈesto/", cl: "/lo emˈbwelβen/", fr: "/vu lɑ̃.ba.le/", it: "/lo iŋkarˈta.te/", br: "/voˈses ẽˈba.lɐ̃w ˈi.su/", pt: "/ẽˈbɾu.ʎɐ̃w ˈiʃ.tu/" } 
    },
    { 
      source_term: "Dá pra cortar de outro jeito?", image: "", gender_pt: "m", 
      translations: { cl: "¿Lo puede cortar diferente?", ar: "¿Lo puede cortar diferente?", gb: "Can you cut it differently?", us: "Can you cut it differently?", pt: "Pode cortar de outra forma?", es: "¿Lo puede cortar de otra manera?", fr: "Pouvez-vous le couper différemment ?", it: "Può tagliarlo diversamente?" }, 
      phonetics: { us: "/kæn ju kʌt ɪt ˈdɪfrəntli/", es: "/lo ˈpweðe koɾˈtaɾ ðe ˈotɾa maˈneɾa/", cl: "/lo ˈpweðe koɾˈtaɾ difeˈɾente/", fr: "/pu.ve vu lə ku.pe di.fe.ʁa.mɑ̃/", it: "/pwɔ taʎˈʎar.lo diverzaˈmen.te/", br: "/da pɾa koʁˈtaʁ dʒi ˈow.tɾu ˈʒej.tu/", pt: "/ˈpɔ.dɨ kuɾˈtaɾ dɨ ˈo.tɾɐ ˈfɔɾ.mɐ/" } 
    },
    { 
      source_term: "Isso tá fresco?", image: "", gender_pt: "m", 
      translations: { cl: "¿Está fresco?", ar: "¿Está fresco?", gb: "Is this fresh?", us: "Is this fresh?", pt: "Isto está fresco?", es: "¿Esto está fresco?", fr: "Est-ce frais ?", it: "È fresco?" }, 
      phonetics: { us: "/ɪz ðɪs frɛʃ/", es: "/ˈesto esˈta ˈfɾesko/", cl: "/esˈta ˈfɾesko/", fr: "/ɛs fʁɛ/", it: "/ɛ ˈfres.ko/", br: "/ˈi.su ta ˈfɾes.ku/", pt: "/ˈiʃ.tu ʃˈta ˈfɾeʃ.ku/" } 
    },
  ],
  services: [
    { 
      source_term: "Vocês fazem entrega?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hacen despacho?", ar: "¿Hacen envíos?", gb: "Do you deliver?", us: "Do you deliver?", pt: "Fazem entregas?", es: "¿Hacen envíos a domicilio?", fr: "Faites-vous la livraison ?", it: "Fate consegne a domicilio?" }, 
      phonetics: { us: "/du ju dɪˈlɪvər/", es: "/ˈaθen emˈbios a ðomiˈθiljo/", cl: "/ˈasen desˈpatʃo/", fr: "/fɛt vu la li.vʁɛ.zɔ̃/", it: "/ˈfa.te konˈseɲ.ɲe a domiˈtʃi.ljo/", br: "/voˈses ˈfa.zẽj ẽˈtɾɛ.ɡɐ/", pt: "/ˈfa.zɐ̃j ẽˈtɾɛ.ɡɐʃ/" } 
    },
    { 
      source_term: "Tem programa de pontos?", image: "", gender_pt: "m", 
      translations: { cl: "¿Tienen puntos?", ar: "¿Tienen programa de puntos?", gb: "Do you have a loyalty scheme?", us: "Do you have a rewards program?", pt: "Têm cartão de pontos?", es: "¿Tienen programa de puntos?", fr: "Avez-vous un programme de fidélité ?", it: "Avete una raccolta punti?" }, 
      phonetics: { us: "/du ju hæv ə rɪˈwɔːrdz ˈproʊɡræm/", es: "/ˈtjenen pɾoˈɣɾama ðe ˈpuntos/", cl: "/ˈtjenen ˈpuntos/", fr: "/a.ve vu œ̃ pʁɔ.ɡʁam də fi.de.li.te/", it: "/aˈve.te ˈu.na rakˈkɔl.ta ˈpun.ti/", br: "/tẽj pɾoˈɡɾɐ̃.mɐ dʒi ˈpõ.tus/", pt: "/tɐ̃j kɐɾˈtɐ̃w dɨ ˈpõ.tuʃ/" } 
    },
    { 
      source_term: "Onde fica o atendimento ao cliente?", image: "", gender_pt: "m", 
      translations: { cl: "¿Dónde está servicio al cliente?", ar: "¿Dónde está atención al cliente?", gb: "Where is customer service?", us: "Where is customer service?", pt: "Onde é o apoio ao cliente?", es: "¿Dónde está atención al cliente?", fr: "Où est le service client ?", it: "Dov'è il servizio clienti?" }, 
      phonetics: { us: "/wɛr ɪz ˈkʌstəmər ˈsɜːrvɪs/", es: "/ˈdonde esˈta atenˈθjon al ˈkljente/", cl: "/ˈdonde esˈta seɾˈβisjo al ˈkljente/", fr: "/u ɛ lə sɛʁ.vis kli.jɑ̃/", it: "/doˈvɛ il serˈvit.tsjo kliˈɛn.ti/", br: "/ˈõ.dʒi ˈfi.kɐ u a.tẽ.dʒiˈmẽ.tu aw kliˈẽ.tʃi/", pt: "/ˈõ.dɨ ɛ u ɐˈpo.ju aw kliˈẽ.tɨ/" } 
    },
    { 
      source_term: "Posso trocar depois?", image: "", gender_pt: "m", 
      translations: { cl: "¿Puedo cambiarlo después?", ar: "¿Tengo cambio?", gb: "Can I exchange this later?", us: "Can I exchange this later?", pt: "Posso trocar depois?", es: "¿Puedo cambiarlo después?", fr: "Puis-je l'échanger plus tard ?", it: "Posso cambiarlo dopo?" }, 
      phonetics: { us: "/kæn aɪ ɪksˈtʃeɪndʒ ðɪs ˈleɪtər/", es: "/ˈpweðo kamˈbjaɾlo ðesˈpwes/", cl: "/ˈpweðo kamˈbjaɾlo ðesˈpwes/", fr: "/pɥi ʒə le.ʃɑ̃.ʒe ply taʁ/", it: "/ˈpɔs.so kamˈbjar.lo ˈdo.po/", br: "/ˈpɔ.su tɾoˈkaʁ deˈpojs/", pt: "/ˈpɔ.su tɾuˈkaɾ dɨˈpojʃ/" } 
    },
    { 
      source_term: "Onde deixo a cesta?", image: "", gender_pt: "f", 
      translations: { cl: "¿Dónde dejo el canasto?", ar: "¿Dónde dejo el canasto?", gb: "Where do I leave the basket?", us: "Where do I leave the basket?", pt: "Onde deixo o cesto?", es: "¿Dónde dejo la cesta?", fr: "Où déposer le panier ?", it: "Dove lascio il cestino?" }, 
      phonetics: { us: "/wɛr du aɪ liːv ðə ˈbæskɪt/", es: "/ˈdonde ˈðexo la ˈθesta/", cl: "/ˈdonde ˈðexo el kaˈnasto/", fr: "/u de.po.ze lə pa.nje/", it: "/ˈdo.ve ˈlaʃ.ʃo il tʃeˈsti.no/", br: "/ˈõ.dʒi ˈdej.ʃu a ˈsɛs.tɐ/", pt: "/ˈõ.dɨ ˈdɐj.ʃu u ˈseʃ.tu/" } 
    },
    { 
      source_term: "Tem carrinho menor?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hay carro más chico?", ar: "¿Hay carrito más chico?", gb: "Do you have a smaller trolley?", us: "Do you have a smaller cart?", pt: "Tem um carrinho mais pequeno?", es: "¿Tienen un carrito más pequeño?", fr: "Avez-vous un chariot plus petit ?", it: "Avete un carrello più piccolo?" }, 
      phonetics: { us: "/du ju hæv ə ˈsmɔːlər kɑːrt/", es: "/ˈtjenen un kaˈrrito mas peˈkeɲo/", cl: "/ai ˈkaro mas ˈtʃiko/", fr: "/a.ve vu œ̃ ʃa.ʁjo ply pə.ti/", it: "/aˈve.te un karˈrɛl.lo pju ˈpik.ko.lo/", br: "/tẽj kaˈhĩ.ɲu meˈnɔʁ/", pt: "/tɐ̃j ũ kɐˈʁi.ɲu majʃ pɨˈke.nu/" } 
    },
    { 
      source_term: "Até que horas vocês abrem?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hasta qué hora atienden?", ar: "¿Hasta qué hora están abiertos?", gb: "What time are you open until?", us: "What time are you open until?", pt: "Até que horas estão abertos?", es: "¿Hasta qué hora abren?", fr: "Jusqu'à quelle heure êtes-vous ouverts ?", it: "Fino a che ora siete aperti?" }, 
      phonetics: { us: "/wʌt taɪm ɑːr ju ˈoʊpən ʌnˈtɪl/", es: "/ˈasta ˈke ˈoɾa ˈaβɾen/", cl: "/ˈasta ˈke ˈoɾa aˈtjenden/", fr: "/ʒys.ka kɛl œʁ ɛt vu u.vɛʁ/", it: "/ˈfi.no a ke ˈo.ra ˈsjɛ.te aˈpɛr.ti/", br: "/aˈtɛ ke ˈɔ.ɾas voˈses ˈa.bɾẽj/", pt: "/ɐˈtɛ ke ˈɔ.ɾɐʃ ɨʃˈtɐ̃w ɐˈbɛɾ.tuʃ/" } 
    },
    { 
      source_term: "Onde é o estacionamento?", image: "", gender_pt: "m", 
      translations: { cl: "¿Dónde está el estacionamiento?", ar: "¿Dónde está el estacionamiento?", gb: "Where is the car park?", us: "Where is the parking lot?", pt: "Onde é o parque de estacionamento?", es: "¿Dónde está el aparcamiento?", fr: "Où est le parking ?", it: "Dov'è il parcheggio?" }, 
      phonetics: { us: "/wɛr ɪz ðə ˈpɑːrkɪŋ lɑːt/", es: "/ˈdonde esˈta el apaɾkaˈmjento/", cl: "/ˈdonde esˈta el estasjonaˈmjento/", fr: "/u ɛ lə paʁ.kiŋ/", it: "/doˈvɛ il parˈked.dʒo/", br: "/ˈõ.dʒi ɛ u is.ta.sjo.naˈmẽ.tu/", pt: "/ˈõ.dɨ ɛ u ˈpaɾ.kɨ dɨ ɨʃ.tɐ.sju.nɐˈmẽ.tu/" } 
    },
  ],
  social: [
    { 
      source_term: "Oi, você pode me ajudar rapidinho?", image: "", gender_pt: "m", 
      translations: { cl: "Hola, ¿me ayuda un poquito?", ar: "Hola, ¿me ayudás un segundo?", gb: "Hi, can you help me quickly?", us: "Hi, can you help me quickly?", pt: "Olá, pode ajudar-me um bocadinho?", es: "Hola, ¿me puede ayudar un momento?", fr: "Bonjour, pouvez-vous m'aider rapidement ?", it: "Ciao, mi puoi aiutare un attimo?" }, 
      phonetics: { us: "/haɪ kæn ju hɛlp mi ˈkwɪkli/", es: "/ˈola me ˈpweðe aʝuˈðaɾ um moˈmento/", cl: "/ˈola me aˈʝuða um poˈkito/", fr: "/bɔ̃.ʒuʁ pu.ve vu me.de ʁa.pid.mɑ̃/", it: "/ˈtʃa.o mi pwɔi ajuˈta.re un ˈat.ti.mo/", br: "/oj voˈse ˈpɔ.dʒi mi a.ʒuˈdaʁ ha.piˈdʒĩ.ɲu/", pt: "/ɔˈla ˈpɔ.dɨ ɐ.ʒuˈdaɾ.mɨ ũ bu.kɐˈdi.ɲu/" } 
    },
    { 
      source_term: "Você tá na fila?", image: "", gender_pt: "m", 
      translations: { cl: "¿Está en la fila?", ar: "¿Estás en la fila?", gb: "Are you in the queue?", us: "Are you in line?", pt: "Está na fila?", es: "¿Está en la cola?", fr: "Vous faites la queue ?", it: "È in fila?" }, 
      phonetics: { us: "/ɑːr ju ɪn laɪn/", es: "/esˈta en la ˈkola/", cl: "/esˈta en la ˈfila/", fr: "/vu fɛt la kø/", it: "/ɛ in ˈfi.la/", br: "/voˈse ta na ˈfi.lɐ/", pt: "/ʃˈta nɐ ˈfi.lɐ/" } 
    },
    { 
      source_term: "Posso passar rapidinho?", image: "", gender_pt: "m", 
      translations: { cl: "¿Puedo pasar rapidito?", ar: "¿Me dejás pasar un segundo?", gb: "Can I squeeze past?", us: "Can I just squeeze past?", pt: "Posso passar rapidinho?", es: "¿Puedo pasar un momento?", fr: "Puis-je passer rapidement ?", it: "Posso passare un attimo?" }, 
      phonetics: { us: "/kæn aɪ dʒʌst skwiːz pæst/", es: "/ˈpweðo paˈsaɾ um moˈmento/", cl: "/ˈpweðo paˈsaɾ rapiˈðito/", fr: "/pɥi ʒə pa.se ʁa.pid.mɑ̃/", it: "/ˈpɔs.so pasˈsa.re un ˈat.ti.mo/", br: "/ˈpɔ.su paˈsaʁ ha.piˈdʒĩ.ɲu/", pt: "/ˈpɔ.su pɐˈsaɾ ʁɐ.piˈdi.ɲu/" } 
    },
    { 
      source_term: "Pode guardar meu lugar um minuto?", image: "", gender_pt: "m", 
      translations: { cl: "¿Me guarda el lugar?", ar: "¿Me guardás el lugar?", gb: "Can you save my spot?", us: "Can you save my spot?", pt: "Pode guardar o meu lugar?", es: "¿Me guarda el sitio un minuto?", fr: "Pouvez-vous garder ma place ?", it: "Mi tiene il posto un attimo?" }, 
      phonetics: { us: "/kæn ju seɪv maɪ spɑːt/", es: "/me ˈɡwaɾða el ˈsitjo um miˈnuto/", cl: "/me ˈɡwaɾða el luˈɣaɾ/", fr: "/pu.ve vu ɡaʁ.de ma plas/", it: "/mi ˈtjɛ.ne il ˈpo.sto un ˈat.ti.mo/", br: "/ˈpɔ.dʒi ɡwaʁˈdaʁ mew luˈɡaʁ ũ miˈnu.tu/", pt: "/ˈpɔ.dɨ ɡwɐɾˈdaɾ u mew luˈɡaɾ/" } 
    },
    { 
      source_term: "Desculpa, pode repetir?", image: "", gender_pt: "m", 
      translations: { cl: "Perdón, ¿puede repetir?", ar: "Perdón, ¿podés repetir?", gb: "Sorry, can you repeat that?", us: "Sorry, can you repeat that?", pt: "Desculpe, pode repetir?", es: "Perdón, ¿puede repetir?", fr: "Pardon, pouvez-vous répéter ?", it: "Scusi, può ripetere?" }, 
      phonetics: { us: "/ˈsɑːri kæn ju rɪˈpiːt ðæt/", es: "/peɾˈðon ˈpweðe repeˈtiɾ/", cl: "/peɾˈðon ˈpweðe repeˈtiɾ/", fr: "/paʁ.dɔ̃ pu.ve vu ʁe.pe.te/", it: "/ˈsku.zi pwɔ riˈpɛ.te.re/", br: "/desˈkuw.pɐ ˈpɔ.dʒi he.peˈtʃiʁ/", pt: "/dɨʃˈkuɫ.pɨ ˈpɔ.dɨ ʁɨ.pɨˈtiɾ/" } 
    },
    { 
      source_term: "Não entendi, pode falar de novo?", image: "", gender_pt: "m", 
      translations: { cl: "No entendí, ¿me dice de nuevo?", ar: "No entendí, ¿me repetís?", gb: "I didn't catch that, say again?", us: "I didn't understand, can you say that again?", pt: "Não percebi, pode dizer de novo?", es: "No entendí, ¿puede decirlo otra vez?", fr: "Je n'ai pas compris, pouvez-vous redire ?", it: "Non ho capito, può ridire?" }, 
      phonetics: { us: "/aɪ dɪdnt ˌʌndərˈstænd kæn ju seɪ ðæt əˈɡɛn/", es: "/no entenˈdi ˈpweðe ðeˈθiɾlo ˈotɾa ˈbeθ/", cl: "/no entenˈdi me ˈðise ðe ˈnweβo/", fr: "/ʒə ne pa kɔ̃.pʁi pu.ve vu ʁə.diʁ/", it: "/non ɔ kaˈpi.to pwɔ riˈdi.re/", br: "/nɐ̃w ẽ.tẽˈdʒi ˈpɔ.dʒi faˈlaʁ dʒi ˈno.vu/", pt: "/nɐ̃w pɨɾ.sɨˈbi ˈpɔ.dɨ diˈzeɾ dɨ ˈno.vu/" } 
    },
    { 
      source_term: "Obrigado, viu? Muito gentil.", image: "", gender_pt: "m", 
      translations: { cl: "Gracias, muy amable.", ar: "Gracias, muy amable.", gb: "Thanks, very kind of you.", us: "Thanks, very kind of you.", pt: "Obrigado, muito gentil.", es: "Gracias, muy amable.", fr: "Merci, c'est très gentil.", it: "Grazie, molto gentile." }, 
      phonetics: { us: "/θæŋks ˈvɛri kaɪnd ʌv ju/", es: "/ˈɡɾaθjas mui aˈmaβle/", cl: "/ˈɡɾasjas mui aˈmaβle/", fr: "/mɛʁ.si sɛ tʁɛ ʒɑ̃.ti/", it: "/ˈɡrat.tsje ˈmol.to dʒenˈti.le/", br: "/o.bɾiˈɡa.du viw ˈmũj.tu ʒẽˈtʃiw/", pt: "/o.bɾiˈɡa.du ˈmũj.tu ʒẽˈtiɫ/" } 
    },
  ],
  location: [
    { 
      source_term: "Onde fica o supermercado?", image: "", gender_pt: "m", 
      translations: { cl: "¿Dónde está el supermercado?", ar: "¿Dónde está el supermercado?", gb: "Where is the supermarket?", us: "Where is the supermarket?", pt: "Onde fica o supermercado?", es: "¿Dónde está el supermercado?", fr: "Où est le supermarché ?", it: "Dov'è il supermercato?" }, 
      phonetics: { us: "/wɛr ɪz ðə ˈsuːpərmɑːrkɪt/", es: "/ˈdonde esˈta el supeɾmeɾˈkaðo/", cl: "/ˈdonde esˈta el supeɾmeɾˈkaðo/", fr: "/u ɛ lə sy.pɛʁ.maʁ.ʃe/", it: "/doˈvɛ il supermerˈka.to/", br: "/ˈõ.dʒi ˈfi.kɐ u su.peʁ.meʁˈka.du/", pt: "/ˈõ.dɨ ˈfi.kɐ u su.pɛɾ.mɨɾˈka.du/" } 
    },
    { 
      source_term: "Como eu chego no supermercado daqui?", image: "", gender_pt: "m", 
      translations: { cl: "¿Cómo llego al supermercado?", ar: "¿Cómo llego al supermercado?", gb: "How do I get to the supermarket?", us: "How do I get to the supermarket?", pt: "Como chego ao supermercado?", es: "¿Cómo llego al supermercado desde aquí?", fr: "Comment aller au supermarché d'ici ?", it: "Come arrivo al supermercato da qui?" }, 
      phonetics: { us: "/haʊ du aɪ ɡɛt tu ðə ˈsuːpərmɑːrkɪt/", es: "/ˈkomo ˈʎeɣo al supeɾmeɾˈkaðo ˈðesðe aˈki/", cl: "/ˈkomo ˈʝeɣo al supeɾmeɾˈkaðo/", fr: "/kɔ.mɑ̃ a.le o sy.pɛʁ.maʁ.ʃe di.si/", it: "/ˈko.me arˈri.vo al supermerˈka.to da kwi/", br: "/ˈko.mu ew ˈʃe.ɡu nu su.peʁ.meʁˈka.du daˈki/", pt: "/ˈko.mu ˈʃe.ɡu aw su.pɛɾ.mɨɾˈka.du/" } 
    },
    { 
      source_term: "Tem algum supermercado por aqui?", image: "", gender_pt: "m", 
      translations: { cl: "¿Hay algún supermercado cerca?", ar: "¿Hay algún supermercado cerca?", gb: "Is there a supermarket around here?", us: "Is there a supermarket around here?", pt: "Há algum supermercado por aqui?", es: "¿Hay algún supermercado por aquí?", fr: "Y a-t-il un supermarché par ici ?", it: "C'è un supermercato qui vicino?" }, 
      phonetics: { us: "/ɪz ðɛr ə ˈsuːpərmɑːrkɪt əˈraʊnd hɪr/", es: "/ai alˈɣun supeɾmeɾˈkaðo poɾ aˈki/", cl: "/ai alˈɣun supeɾmeɾˈkaðo ˈseɾka/", fr: "/i a til œ̃ sy.pɛʁ.maʁ.ʃe paʁ i.si/", it: "/tʃɛ un supermerˈka.to kwi viˈtʃi.no/", br: "/tẽj awˈɡũ su.peʁ.meʁˈka.du poʁ aˈki/", pt: "/a ɐɫˈɡũ su.pɛɾ.mɨɾˈka.du puɾ ɐˈki/" } 
    },
    { 
      source_term: "É longe o supermercado?", image: "", gender_pt: "m", 
      translations: { cl: "¿Queda lejos el supermercado?", ar: "¿Queda lejos el supermercado?", gb: "Is the supermarket far?", us: "Is the supermarket far?", pt: "O supermercado é longe?", es: "¿Está lejos el supermercado?", fr: "Le supermarché est-il loin ?", it: "È lontano il supermercato?" }, 
      phonetics: { us: "/ɪz ðə ˈsuːpərmɑːrkɪt fɑːr/", es: "/esˈta ˈlexos el supeɾmeɾˈkaðo/", cl: "/ˈkeða ˈlexos el supeɾmeɾˈkaðo/", fr: "/lə sy.pɛʁ.maʁ.ʃe ɛ til lwɛ̃/", it: "/ɛ lonˈta.no il supermerˈka.to/", br: "/ɛ ˈlõ.ʒi u su.peʁ.meʁˈka.du/", pt: "/u su.pɛɾ.mɨɾˈka.du ɛ ˈlõ.ʒɨ/" } 
    },
    { 
      source_term: "Onde fica a mercearia?", image: "", gender_pt: "f", 
      translations: { cl: "¿Dónde está el almacén?", ar: "¿Dónde está el almacén?", gb: "Where is the grocery store?", us: "Where is the grocery store?", pt: "Onde fica a mercearia?", es: "¿Dónde está la tienda de comestibles?", fr: "Où est l'épicerie ?", it: "Dov'è il negozio di alimentari?" }, 
      phonetics: { us: "/wɛr ɪz ðə ˈɡroʊsəri stɔːr/", es: "/ˈdonde esˈta la ˈtjenda ðe komesˈtiβles/", cl: "/ˈdonde esˈta el almaˈsen/", fr: "/u ɛ le.pi.sʁi/", it: "/doˈvɛ il neˈɡɔt.tsjo di alimenˈta.ri/", br: "/ˈõ.dʒi ˈfi.kɐ a meʁ.se.aˈɾi.ɐ/", pt: "/ˈõ.dɨ ˈfi.kɐ ɐ mɨɾ.sjɐˈɾi.ɐ/" } 
    },
    { 
      source_term: "Onde fica a padaria?", image: "", gender_pt: "f", 
      translations: { cl: "¿Dónde está la panadería?", ar: "¿Dónde está la panadería?", gb: "Where is the bakery?", us: "Where is the bakery?", pt: "Onde fica a padaria?", es: "¿Dónde está la panadería?", fr: "Où est la boulangerie ?", it: "Dov'è il panificio?" }, 
      phonetics: { us: "/wɛr ɪz ðə ˈbeɪkəri/", es: "/ˈdonde esˈta la panaðeˈɾia/", cl: "/ˈdonde esˈta la panaðeˈɾia/", fr: "/u ɛ la bu.lɑ̃.ʒʁi/", it: "/doˈvɛ il paniˈfi.tʃo/", br: "/ˈõ.dʒi ˈfi.kɐ a pa.daˈɾi.ɐ/", pt: "/ˈõ.dɨ ˈfi.kɐ ɐ pɐ.dɐˈɾi.ɐ/" } 
    },
  ],
  quantities: [
    { 
      source_term: "Apenas um pouco", image: "", gender_pt: "m", 
      translations: { cl: "Solo un poco", ar: "Solo un poco", gb: "Just a little", us: "Just a little", pt: "Só um pouco", es: "Solo un poco", fr: "Juste un peu", it: "Solo un po'" }, 
      phonetics: { us: "/dʒʌst ə ˈlɪtəl/", es: "/ˈsolo um ˈpoko/", cl: "/ˈsolo um ˈpoko/", fr: "/ʒyst œ̃ pø/", it: "/ˈso.lo um pɔ/", br: "/sɔ ũ ˈpow.ku/", pt: "/sɔ ũ ˈpo.ku/" } 
    },
    { 
      source_term: "Mais, por favor", image: "", gender_pt: "m", 
      translations: { cl: "Más, por favor", ar: "Más, por favor", gb: "More, please", us: "More, please", pt: "Mais, por favor", es: "Más, por favor", fr: "Plus, s'il vous plaît", it: "Di più, per favore" }, 
      phonetics: { us: "/mɔːr pliːz/", es: "/mas poɾ faˈβoɾ/", cl: "/mas poɾ faˈβoɾ/", fr: "/ply sil vu plɛ/", it: "/di pju per faˈvo.re/", br: "/majs poʁ faˈvoʁ/", pt: "/majʃ puɾ fɐˈvoɾ/" } 
    },
    { 
      source_term: "Menos, por favor", image: "", gender_pt: "m", 
      translations: { cl: "Menos, por favor", ar: "Menos, por favor", gb: "Less, please", us: "Less, please", pt: "Menos, por favor", es: "Menos, por favor", fr: "Moins, s'il vous plaît", it: "Meno, per favore" }, 
      phonetics: { us: "/lɛs pliːz/", es: "/ˈmenos poɾ faˈβoɾ/", cl: "/ˈmenos poɾ faˈβoɾ/", fr: "/mwɛ̃ sil vu plɛ/", it: "/ˈme.no per faˈvo.re/", br: "/ˈme.nus poʁ faˈvoʁ/", pt: "/ˈme.nuʃ puɾ fɐˈvoɾ/" } 
    },
    { 
      source_term: "Meio quilo", image: "", gender_pt: "m", 
      translations: { cl: "Medio kilo", ar: "Medio kilo", gb: "Half a kilo", us: "One pound", pt: "Meio quilo", es: "Medio kilo", fr: "Un demi-kilo", it: "Mezzo chilo" }, 
      phonetics: { us: "/wʌn paʊnd/", es: "/ˈmedjo ˈkilo/", cl: "/ˈmedjo ˈkilo/", fr: "/œ̃ də.mi ki.lo/", it: "/ˈmɛd.dzo ˈki.lo/", br: "/ˈmej.u ˈki.lu/", pt: "/ˈmɐj.u ˈki.lu/" } 
    },
    { 
      source_term: "Fatiado fino", image: "", gender_pt: "m", 
      translations: { cl: "Laminado fino", ar: "Cortado fino", gb: "Thinly sliced", us: "Thin sliced", pt: "Fatiado fino", es: "Cortado fino", fr: "Tranches fines", it: "Tagliato fine" }, 
      phonetics: { us: "/θɪn slaɪst/", es: "/koɾˈtaðo ˈfino/", cl: "/lamiˈnaðo ˈfino/", fr: "/tʁɑ̃ʃ fin/", it: "/taʎˈʎa.to ˈfi.ne/", br: "/fa.tʃiˈa.du ˈfi.nu/", pt: "/fɐˈtja.du ˈfi.nu/" } 
    },
  ]
};
