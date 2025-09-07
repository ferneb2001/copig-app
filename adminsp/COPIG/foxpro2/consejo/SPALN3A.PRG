procedure spaln3a
* Notificaciones (nota nro 3) a Municipalidades    
*        modificado para todas las municipalidades
set talk off
dimension wmeses(12)
store 'enero' to wmeses(1)
store 'febrero' to wmeses(2)
store 'marzo'   to wmeses(3)
store 'abril'   to wmeses(4)
store 'mayo'    to wmeses(5)
store 'junio'   to wmeses(6)
store 'julio'   to wmeses(7)
store 'agosto'  to wmeses(8)
store 'setiembre' to wmeses(9)
store 'octubre'   to wmeses(10)
store 'noviembre' to wmeses(11)
store 'diciembre' to wmeses(12)
@04,01 clear to 23,78
@04,30 say 'NOTIFICACIONES NOTA NRO.3  A MUNICIPALIDADES'
@06,01 say 'Matricula:       Categor¡a:    Nombre:'
@08,01 say 'Nota N§:         Citese Expte N§     :'
@10,01 say 'Expediente Consejo    :'
@12,01 say 'Expediente/s Municipal/es :'
@14,01 say 'de la Municipalidad de:'
select 1
use spprof index spprof
select 2
use spmatri index spmatri
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
select 6
use sptitu order titulo
wkey=space(7)
wkey1=space(9)
wmatri=0
wnombre=space(30)
wcateg=space(2)
do while wmatri<>99999
   wmatri=0
   wcateg=space(2)
   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
   @06,12 get wmatri pict '99999'
   @23,01 clear to 23,78
   read
   if wmatri<>99999
   @06,29 get wcateg pict '!!'
   read
   wkey=str(wmatri,5)+wcateg
   select 2
   seek(wkey)
   if found()
      wkey1=str(dctipo,1)+str(dcnro,8)
      wtitulo=titulo
      select 1
      seek(wkey1)
      if found()
         wnombre=nombre
         wnota=0
         wexpte=space(10)
         worden=space(12)
         @06,40 say nombre
         select 6
         seek(wtitulo)
         if found()
            wnomtit=titdesc
         else
            wnomtit=space(30)
         endif      
         select 1                  
         @08,10 get wnota pict '99999'
         @08,40 get wexpte pict '!!!!!!!!!!'
*         @08,56 get worden pict '99999'
         read
         wexptes=space(12)
         wante=space(45)
         wmunic=space(3)
         @10,25 get wexptes
         @12,25 get wante
         read
         @23,01 SAY 'Seleccione Municipalidad y oprima <ESC>'
         define window pdpto from 07,55 to 22,77
         activate window pdpto
         select 5
         brow in window pdpto
         deactivate window pdpto
         @23,01 clear to 23,78
         wnomdpto=nombre
         wmunic=dpto
    *     read
         @14,25 say wnomdpto
         wnomunic=space(15)
         wnumunic=1
*	     wnomunic=wnomdpto
*	     wnumunic=wmunic
         wop=1
         @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=1
            set printer to lpt1
            set console off
            set printer on
            set device to printer
            wopim=1
            wcop=2
            @23,01 clear to 23,78
            @23,30 get wopim pict '@*H \<Epson;\<H.P. ' size 1,1
            read
            wcopmun=18
*		    wcopmun=1 
            do while wcopmun>0
               wcopias=2
               do while wcopias>0
               if wopim=1
*                  ??CHR(027)+CHR(069)
*                  ???chr(27)+chr(18)
                  ?'CONSEJO  PROFESIONAL  DE  INGENIEROS  Y  GEOLOGOS'
                  ?'Decreto Ley   3485/63 - Ley N§ 5908 y Ley N§ 6377'
                  ?'Av.Mitre 617 - Tel.4239178'
                  ?'5500    -    M E N D O Z A'
                  ?
                  ?'NOTA N§'
                  ???chr(27)+chr(71)
                  ??wnota pict '99999' at 09
                  ???chr(27)+chr(72)
                  ?
                  ?'CITESE: Expte.N§ '
                  ???chr(27)+chr(71)
                  ??wexpte pict 'XXXXXXXXXX' at 19
                  ???chr(27)+chr(72)
                  ?
                  ?'MENDOZA,' at 28
                  ??day(date()) pict '99' at 37
                  ??' de '    at 40 
                  ??wmeses(month(date())) at 44
                  ??' de '    at 54
                  ??year(date()) at 58
                  ?
                  ?
                  ? 
                  ?'Al Se¤or:'
                  ???chr(27)+chr(71)
                  ?'INTENDENTE DE LA'
                  ?'MUNICIPALIDAD DE'
                  if wcopias=wcop
                  	do buscamun
                  endif
                  ?wnomunic
                  ???chr(27)+chr(72)
                  ?
                  ?
                  ?'                         REF.: Expte. Consejo   N§: '
                  ??wexptes
                  ?'                               Expte/s. Municipal/es N§: '
                  ?'                       '
                  ??wante
                  ?'                               Municipalidad de '
                  ??wnomdpto
                  ?
                  ?
                  ?
                  ?'De nuestra consideraci¢n:'
                  ?
                  ?'                         Tenemos el agrado de dirigirnos al Se¤or In-'
                  ?'tendente con el fin de poner en su conocimiento,  y a los efectos que'
                  ?'estime corresponder, que mediante Resoluci¢n del  Consejo N  22/94 se'
                  ?'ha dispuesto sancionar con  "SUSPENSION EN EL  EJERCICIO  PROFESIONAL'
                  ?'en todo el  mbito de la Provincia, al profesional: '                 
                  ?
                  ?' *  '
                  ?? wnomtit
                  ??' D.: '
                  ??wnombre
                  ?' *           Matr. N§ ' 
                  ??wmatri pict '99999'
                  ??'    Categ.: ' 
                  ??wcateg
                  ?
                 ???chr(27)+chr(72)
                 ?'por no dar cumplimiento a la presentaci¢n del  Certificado de Habili-'
                 ?'taci¢n Profesional, conforme a Ley 5908/92. La misma  ser   levantada'
                 ?'una vez que haya dado cumplimiento a lo establecido en el Decreto Ley'
                 ?'3485/63 mod. por ley 5908/92, conforme a  actuaciones  de la referen-'
                 ?'cia.-'
                 ?
                 ?'                            Con tal motivo, saludamos a Ud muy atte.-'
                 
                 wcopias=wcopias-1
                 eject
              else
                ??chr(027)+chr(069)
              	set margin to 10.
*                  ??chr(27)+chr(18)
                  ?'CONSEJO  PROFESIONAL  DE  INGENIEROS  Y  GEOLOGOS'
                  ?'Decreto Ley   3485/63 - Ley N§ 5908 y Ley N§ 6377'
                  ?'Av.Mitre 617 - Tel.239178'
                  ?'5500    -   M E N D O Z A'
                  ?
                  ?'NOTA N§'
                  ??chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
*                  ??chr(27)+chr(71)
                  ??wnota pict '99999' at 09
                  ??chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
*                  ??chr(27)+chr(72)
                  ?'CITESE: Expte.N§'
                  ??chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
*                  ??chr(27)+chr(71)
                  ??wexpte pict 'XXXXXXXXXX' at 18
                  ??chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
*                  ??chr(27)+chr(72)
                  ?'MENDOZA,' at 28
                  ??day(date()) pict '99' at 37
                  ??' de '    at 40 
                  ??wmeses(month(date())) at 44
                  ??' de '    at 54
                  ??year(date()) at 58
                  ?
                  ?
                  ? 
                  ?'Al Se¤or:'
                  ??chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
*                  ??chr(27)+chr(71)
                  ?'INTENDENTE DE LA'
                  ?'MUNICIPALIDAD DE'
                  if wcopias=wcop
                  	do buscamun
                  endif
                  ?wnomunic
                  ??chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
*                  ??chr(27)+chr(72)
                  ?
                  ?
                  ?'                         REF.: Expte. Consejo   N§: '
                  ??wexptes
                  ?'                               Expte/s. Municipal/es N§: '
                  ?'                       '
                  ??wante
                  ?'                               Municipalidad de '
                  ??wnomdpto
                  ?
                  ?
                  ?
                  ?'De nuestra consideraci¢n:'
                  ?
                  ?'                         Tenemos el agrado de dirigirnos al Se¤or In-'
                  ?'tendente, con el fin de poner en su conocimiento  y a los efectos que'
                  ?'estime corresponder, que mediante Resoluci¢n del  Consejo N  22/94 se'
                  ?'ha dispuesto sancionar con  "SUSPENSION EN EL  EJERCICIO  PROFESIONAL'
                  ?'en todo el  mbito de la Provincia, al profesional: '                 
                  ?
                  ?' *  '
                  ?? wnomtit
                  ??' D.: '
                  ??wnombre
                  ?' *           Matr. N§ ' 
                  ??wmatri pict '99999'
                  ??'    Categ.: ' 
                  ??wcateg
                  ?
*                  ??chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
*                 ??chr(27)+chr(72)
                 ?'por no dar cumplimiento a la presentaci¢n del  Certificado de Habili-'
                 ?'taci¢n Profesional, conforme a Ley 5908/92. La misma  ser   levantada'
                 ?'una vez que haya dado cumplimiento a lo establecido en el Decreto Ley'
                 ?'3485/63 mod. por ley 5908/92, conforme a  actuaciones  de la referen-'
                 ?'cia.-'
                 ?
                 ?'                            Con tal motivo, saludamos a Ud muy atte.-'
                 
                 wcopias=wcopias-1
                 eject
              endif   
              enddo
              wcopmun=wcopmun-1
            enddo   
           select 7
            use spnotif
            append blank
            replace nro    with wnota
            replace fecha  with date()
            replace orden  with worden
            replace tipo   with 3
            replace expte  with wexpte
            replace matri  with wmatri
            replace categ  with wcateg
            replace exptes with wexptes
            replace ante   with wante
            replace observac with wnomunic
           *eject
           set printer off
           set device to screen
         endif  
*      else
*           @06, 40 say 'No existe'  
      endif
    endif
  endif    
enddo
@04,01 clear to 23,78
close all


procedure buscamun
select 5
seek(wnumunic)   
if found()
   wnomunic=nombre
else
   wnomunic=space(15)
endif
wnumunic=wnumunic+1
return   