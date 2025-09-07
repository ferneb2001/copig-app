procedure spacse
*Consulta al archivo de sanciones empresas
@04,01 clear to 23,78
@04,20 say 'CONSULTAS AL  ARCHIVO DE SANCIONES DE EMPRESAS'
@07,02 say 'MATRICULA        CATEGORIA    NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
select 1 
use spprofe index spprofe
select 2
use spmatrie index spmatrie
select 4
use spsance index spsance
do while wsigue='S'
   @23,01 say 'Indique el nro.de matricula o <ESC> para salir'
   @07,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
*      @23,01 say 'Indique la categoria'
*      @07,29 get wcat pict '!!'
*      read
      wcat='EM'
      @23,01 clear to 23,78
      wkey=str(wmatri,5)+wcat
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         seek(wkey1)
         if found()
            @07,39 say nombre
            do buscasen with wmatri, wcat
           * select 4
           * define window psanc from 09,5 to 22,75 title "Sanciones"
           * activate window psanc
           * browse fields saninci, sanresol, sanferes, sancnmat, sancpag;
           * for matric=wmatri and catego=wcat in psanc
           * deactivate window psanc
         else
            @08,39 say 'No existe'
         endif      
      else
         @08,39 say 'No existe'
      endif
   else
      wsigue='N'
   endif       
enddo
@04,01 clear to 23,78
close all
return
