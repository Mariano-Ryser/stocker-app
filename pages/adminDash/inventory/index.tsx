import {useEffect} from 'react'
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Component() {
    const { t} = useLanguage();



  return (<>
      <h2>{t("inventory.title")}</h2>
      <p>{t("inventory.p")}</p>
  </>
  );
}