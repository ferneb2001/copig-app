procedure spaln5
* Notificaciones a Empresas (nota nro 1)    
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
@04,30 say 'NOTIFICACIONES NOTA NRO.2 (para Empresas)'
@06,01 say 'Matricula:       Categor¡a:    Nombre:'
@08,01 say 'Nota N§:         Citese Expte N§:            Orden N§:'
@10,01 say 'Expedientes:'
@12,01 say 'Ante:'
@14,01 say 'Observacion:'
select 1
use spprofe index spprofe
select 2
use spmatrie index spmatrie
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
*select 6
*use sptitu order titulo
wkey=space(7)
wkey1=space(9)
wmatri=0
wcateg=space(2)
do while wmatri<>99999
   wobservacion=space(65)
   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
   @06,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if wmatri<>99999
      @06,29 get wcateg pict '!!'
      read
      wkey=str(wmatri,5)+wcateg
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
 *        wtitulo=titulo
         select 1
         seek(wkey1)
         if found()
            wnota=0
            wexpte=space(10)
            worden=space(12)
            @06,40 say nombre
            select 3
            seek(str(a.locali,3))
            if found()
               wnomloc=nombre
               wcp=cpost
            else
               wnomloc=space(15)
            endif
            select 5
            seek(str(a.dpto,3))
            if found()
               wnomdpto=nombre
            else
               wnomdpto=space(15)
            endif
            select 4
            seek(a.provin)
            if found()
               wnomprov=nombre
            else
               wnomprov=space(15)
            endif
  *          select 6
  *          seek(wtitulo)
  *          if found()
  *             wnomtit=titdesc
  *          else
  *             wnomtit=space(15)
  *          endif      
            select 1
            @08,10 get wnota pict '99999'
            @08,35 get wexpte pict '!!!!!!!!!!'
            @08,56 get worden pict 'XXXXXXXXXXXX'
            read
            wexptes=space(47)
            wante=space(50)
            @10,14 get wexptes
            @12,14 get wante
            @14,14 get wobservacion
            read
            wop=1
            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               wcopias=2
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               wopim=1
               @23,01 clear to 23,78
               @23,30 get wopim pict '@*H \<Epson;\<H.P ' size 1,1
               read
               do while wcopias>0
               if wopim+1
                  ?'CONSEJO PROFESIONAL DE'
                  ?'INGENIEROS  Y GEOLOGOS'
                  ?'Decreto Ley N§ 3485/63'
                  ?'M E N D O Z A'
                  ?
                  ?'NOTA N§'
                  ??chr(27)+chr(71)
                  ??wnota pict '99999' at 09
                  ??chr(27)+chr(72)
                  ?'CITESE: Expte.N§'
                  ??chr(27)+chr(71)
                  ??wexpte pict 'XXXXXXXXXX' at 18
                  ??chr(27)+chr(72)
                  ?'ORDEN N§:'
                  ??chr(27)+chr(71)
                  ??worden pict 'XXXXXXXXXXXX' at 11
                  ??chr(27)+chr(72)
                  ? 
                  ?'Se¤or(es):'
                  ??chr(27)+chr(71)
  *                ?wnomtit
                  ?nombre
                  ?domici
                  ?wnomloc
                  ?wnomdpto
                  ?wcp
                  ??wnomprov at 7
                  ??chr(27)+chr(72)
                  ?
                  ? 
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'MENDOZA,' at 26
                  ??day(date()) pict '99' at 35
                  ??' de '    at 38
                  ??wmeses(month(date())) at 42
                  ??' de '    at 52
                  ??year(date()) at 56
                  ?
                  ?'De nuestra consideraci¢n:'
                  ?
                  ?'                         En ejercicio de la funci¢n de control de la'
                  ?'matr¡cula y actividad profesional, le(s) comunicamos que  habi‚ndose'
                  ?'verificado el Expte N§'
                  ??chr(27)+chr(71) at 24
                  ??wexptes at 24
                  ??chr(27)+chr(72)
                  ?'tramitado ante'
                  ??chr(27)+chr(71)
                  ??wante at 17
                  ??chr(27)+chr(72)
                  ?'se  ha constatado:  falta de Certificado de Habilitaci¢n Profesional'
                  ?wobservacion
                  ?                                                                      
                  ?'                         En consecuencia, se le(s) corre  vista  por'
                  ?'diez (10) d¡as h biles para que efect£e(n) su  descargo y cumpla(n),' 
                  ?'en el caso, con sus obligaciones estau¡das en la legislaci¢n vigente,'
                  ?'Ley 5908, Art. 46§.-'
                  ?
                  ?'                         Caso contrario, podr (n) ser  pasible(s) de'
                  ?'aplicaci¢n de las sanciones pertinentes, establecidas en el Decreto-'
                  ?'Ley 3485/63 Art. 34.-'                                              
                  ?
                  ?'                         Saludamos a Ud(es). muy atentamente.-'
                  wcopias=wcopias-1
                  eject
               else
               	  set margin to 10
               	  ??chr(027)+chr(069)
                  ?'CONSEJO PROFESIONAL DE'
                  ?'INGENIEROS  Y GEOLOGOS'
                  ?'Decreto Ley N§ 3485/63'
                  ?'M E N D O Z A'
                  ?
                  ?'NOTA N§'
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(051)+CHR(066)
*                  ??chr(27)+chr(71)
                  ??wnota pict '99999' at 09
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
*                  ??chr(27)+chr(72)
                  ?'CITESE: Expte.N§'
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(051)+CHR(066)
*                  ??chr(27)+chr(71)
                  ??wexpte pict 'XXXXXXXXXX' at 18
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
*                  ??chr(27)+chr(72)
                  ?'ORDEN N§:'
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(051)+CHR(066)
*                  ??chr(27)+chr(71)
                  ??worden pict 'XXXXXXXXXXXX' at 11
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
*                  ??chr(27)+chr(72)
                  ? 
                  ?'Se¤or(es):'
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(051)+CHR(066)
*                  ??chr(27)+chr(71)
  *                ?wnomtit
                  ?nombre
                  ?domici
                  ?wnomloc
                  ?wnomdpto
                  ?wcp
                  ??wnomprov at 7
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
*                  ??chr(27)+chr(72)
                  ?
                  ? 
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'MENDOZA,' at 26
                  ??day(date()) pict '99' at 35
                  ??' de '    at 38
                  ??wmeses(month(date())) at 42
                  ??' de '    at 52
                  ??year(date()) at 56
                  ?
                  ?'De nuestra consideraci¢n:'
                  ?
                  ?'                         En ejercicio de la funci¢n de control de la'
                  ?'matr¡cula y actividad profesional, le(s) comunicamos que  habi‚ndose'
                  ?'verificado el Expte N§'
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(051)+CHR(066) AT 24
*                  ??chr(27)+chr(71) at 24
                  ??wexptes at 24
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
*                  ??chr(27)+chr(72)
                  ?'tramitado ante'
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(051)+CHR(066)
*                  ??chr(27)+chr(71)
                  ??wante at 17
                  ??CHR(027)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
*                  ??chr(27)+chr(72)
                  ?'se  ha constatado:  falta de Certificado de Habilitaci¢n Profesional'
                  ?wobservacion
                  ?                                                                      
                  ?'                         En consecuencia, se le(s) corre  vista  por'
                  ?'diez (10) d¡as h biles para que efect£e(n) su  descargo y cumpla(n),' 
                  ?'en el caso, con sus obligaciones estau¡das en la legislaci¢n vigente,'
                  ?'Ley 5908, Art. 46§.-'
                  ?
                  ?'                         Caso contrario, podr (n) ser  pasible(s) de'
                  ?'aplicaci¢n de las sanciones pertinentes, establecidas en el Decreto-'
                  ?'Ley 3485/63 Art. 34.-'                                              
                  ?
                  ?'                         Saludamos a Ud(es). muy atentamente.-'
                  wcopias=wcopias-1
                  eject
               endif   
               enddo    
              select 7
              use spnotif
              append blank
              replace nro    with wnota
              replace fecha  with date()
              replace orden  with worden
              replace tipo   with 2
              replace expte  with wexpte
              replace matri  with wmatri
              replace categ  with wcateg
              replace exptes with wexptes
              replace ante   with wante
              replace observac with wobservacion
              *eject
              set printer off
              set device to screen
            endif  
         else
            @06, 40 say 'No existe'  
         endif
      endif    
   endif    
enddo
@04,01 clear to 23,78
close all   
close all
   