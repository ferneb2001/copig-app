procedure spscxr
*  indexa archivo de certificados por distintas claves
set talk off
clear
@03,15 say "Crea indices del archivo de Certificados"
@23,05 say 'Ubique el cursor en la opci¢n <yes> cuando aparece por pantalla'
@24,05 say 'y d‚ enter en cada ocasi¢n'
use spcerxx
index on str(cecerti,7)+str(cematri,5)+cecateg to spcerxcm
index on cenombre to spcerxof
index on str(cematri,5)+cecateg to spcerxmc
close all
@03,01 clear to 03,79
return