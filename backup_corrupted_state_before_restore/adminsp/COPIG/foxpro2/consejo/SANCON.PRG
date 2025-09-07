procedure sancon
*Consulta al archivo de sanciones a no profesionales
@04,01 clear to 23,78
@04,12 say 'CONSULTAS AL  ARCHIVO DE SANCIONES A NO PROFESIONALES'
@07,02 say 'ORDEN        CLASE       NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
wnombre=space(30)
select 4
use sancion index sancion
do while wsigue='S'
   @23,01 say 'Indique el nro.de orden  o <ESC> para salir'
   @07,9 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 say 'Indique la clase '
      @23,18 say 'P=Profesional EN=Entidad/Empresa  F=Pers.Fisica/otros '
      @07,22 get wcat pict '!!'
      read
      @23,01 clear to 23,78
      wkey=str(wmatri,5)+wcat
      locate for wkey=str(matric,5)+catego
      if found()
            @07,39 say nombre
            do bussanc with wmatri, wcat
            select 4
           * define window psanc from 09,5 to 22,75 title "Sanciones"
           * activate window psanc
           * browse fields saninci, sanresol, sanferes, sancnmat, sancpag;
           * for matric=wmatri and catego=wcat in psanc
           * deactivate window psanc
         *  skip 1
         *  continue
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

procedure ingresar
return
