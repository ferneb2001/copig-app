procedure spscxr6
*  indexa archivo de certificados por distintas claves
set talk off
clear
@03,15 say "Crea indices del archivo de Certificados"
@23,05 say 'Ubique el cursor en la opci¢n <yes> cuando aparece por pantalla'
@24,05 say 'y d‚ enter en cada ocasi¢n'
use spcer96
index on str(cecerti,7)+str(cematri,5)+cecateg to spcer6cm
*index on cenombre to spcer6of
*index on str(cematri,5)+cecateg to spcer6mc
close all
@03,01 clear to 03,79
return