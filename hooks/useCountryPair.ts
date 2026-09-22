import { useCallback, useEffect, useRef, useState } from 'react';
import type { Country } from '../types';
import { readJSON, writeJSON } from '../utils/storage';

export const NATIVE_COUNTRY_KEY = 'nativeCountry';
export const TARGET_COUNTRY_KEY = 'targetCountry';

const isCode = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

/**
 * O par "Eu falo" / "Estou em", persistido.
 *
 * Antes o par vivia em `useState` puro e voltava para Brasil → Espanha a cada
 * abertura. Para o dono do app o padrão já é o certo, mas os outros três
 * públicos declarados — marroquino, ucraniano e lituano — reconfiguravam o app
 * toda vez, e é isso que decide se os módulos de catálogo abrem.
 *
 * Guarda só o **código do país**, não o objeto: se `COUNTRIES` mudar, o que
 * está salvo continua sendo resolvido contra a lista atual. Código que não
 * existe mais cai no padrão sem apagar nada em silêncio — o valor bruto segue
 * gravado até a próxima escolha.
 *
 * `aberto` aplica o recorte do lançamento (ver `lancamento.ts`) com a mesma
 * regra: país salvo que hoje está desativado cai no padrão, mas continua
 * gravado, e volta sozinho quando o recorte cair.
 */
const tudoAberto = () => true;

export const useCountryPair = (
  countries: Country[],
  aberto: { origem?: (c: Country) => boolean; destino?: (c: Country) => boolean } = {},
) => {
  const { origem = tudoAberto, destino = tudoAberto } = aberto;

  const resolve = useCallback(
    (key: string, fallbackCode: string, permitido: (c: Country) => boolean): Country => {
      const saved = readJSON<string | null>(key, null, (v): v is string | null => v === null || isCode(v));
      return countries.find((c) => c.code === saved && permitido(c))
        ?? countries.find((c) => c.code === fallbackCode)
        ?? countries[0];
    },
    [countries],
  );

  const [nativeCountry, setNativeCountry] = useState<Country>(() => resolve(NATIVE_COUNTRY_KEY, 'br', origem));
  const [targetCountry, setTargetCountry] = useState<Country>(() => resolve(TARGET_COUNTRY_KEY, 'es', destino));

  /**
   * Grava a partir da segunda vez, isto é, quando o valor mudou de verdade.
   *
   * Gravar já na montagem apagaria em silêncio um código que esta versão não
   * reconhece: o app cairia no padrão e, de quebra, destruiria a escolha
   * original. Pulando a hidratação, um valor que só uma versão futura entende
   * sobrevive — e uma escolha explícita do usuário continua sendo gravada.
   */
  const hidratado = useRef({ native: false, target: false });

  useEffect(() => {
    if (!hidratado.current.native) { hidratado.current.native = true; return; }
    writeJSON(NATIVE_COUNTRY_KEY, nativeCountry.code);
  }, [nativeCountry]);

  useEffect(() => {
    if (!hidratado.current.target) { hidratado.current.target = true; return; }
    writeJSON(TARGET_COUNTRY_KEY, targetCountry.code);
  }, [targetCountry]);

  /**
   * `lang` e `dir` do documento seguem o idioma da INTERFACE, que é o país
   * nativo — o mesmo que alimenta `t()`. Não é o idioma de destino nem o do
   * áudio: o leitor de tela precisa saber em que língua a página está escrita.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.lang = nativeCountry.lang;
    root.dir = nativeCountry.lang.startsWith('ar') ? 'rtl' : 'ltr';
  }, [nativeCountry]);

  return { nativeCountry, setNativeCountry, targetCountry, setTargetCountry };
};
