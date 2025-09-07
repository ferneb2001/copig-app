procedure spaln1
* Notificaciones (nota nro 1)    
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
@04,30 say 'NOTIFICACIONES NOTA NRO.1'
@06,01 say 'Matricula:       Categor¡a:    Nombre:'
@08,01 say 'Nota N§:         Citese Expte N§:            Orden N§:'
@10,01 say 'Expedientes:'
@12,01 say 'Ante:'
@14,01 say 'Observaciones:'
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
            select 6
            seek(wtitulo)
            if found()
               wnomtit=titdesc
            else
               wnomtit=space(15)
            endif      
            select 1                  
            @08,10 get wnota pict '99999'
            @08,35 get wexpte pict '!!!!!!!!!!!!'
            @08,56 get worden pict '!!!!!!!!!!!!'
            read
            wexptes=space(47)
            wante=space(50)
            wobservacion=space(65)
            @10,14 get wexptes
            @12,14 get wante
            @14,14 get wobservacion
            read
            wop=1
            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               wcopias=2
               do while wcopias>0
                  ?'CONSEJO PROFESIONAL DE'
                  ?'INGENIEROS  Y GEOLOGOS'
                  ?'Decreto Ley N.3485/63'
                  ?'M E N D O Z A'
                  ?
                  ?'NOTA N§'
                  ??chr(27)+chr(71)
                  ??wnota pict '99999' at 09
                  ??chr(27)+chr(72)
                  ?'CITESE: Expte.N§'
                  ??chr(27)+chr(71)
                  ??wexpte pict 'XXXXXXXXXXXX' at 18
                  ??chr(27)+chr(72)
                  ?'ORDEN N§:'
                  ??chr(27)+chr(71)
                  ??worden pict 'XXXXXXXXXXXX' at 11
                  ??chr(27)+chr(72)
                  ? 
                  ?'Se¤or:'
                  ??chr(27)+chr(71)
                  ?wnomtit
                  ?nombre
                  ?domici
                  ?wnomloc
                  ?wnomdpto
                  ?wcp
                  ??wnomprov at 7
                  ?    
                  ?chr(27)+chr(72)
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
                  ?'matr¡cula y actividad profesional, le comunicamos que habi‚ndose ve-'
                  ?'rificado el Expte N§'
                  ??chr(27)+chr(71) at 22
                  ??wexptes at 22
                  ??chr(27)+chr(72)
                  ?'tramitado ante'
                  ??chr(27)+chr(71)
                  ??wante at 17
                  ??chr(27)+chr(72)
                  ?'se ha constatado: falta de boleta de Honorarios; de acuerdo al Decre'
                  ?'to Ley 3405/63, se ha transgredido el Cap¡tulo IV - R‚gimen de Hono-'
                  ?'rarios, en sus articulos 23§; 24§ y 27§ y el Decreto 1041/65 en sus '
                  ?'Articulos 8§, 10§ y 19§'
                  ? wobservacion
                  ?
                  ?'                         En consecuencia, se le corre vista por diez'
                  ?'(10) d¡as para que efect£e su descargo y cumpla, en el caso, con sus'
                  ?'obligaciones estatu¡das en la legislaci¢n vigente'
                  ?
                  ?'                         Caso contrario, podr  ser pasible de aplica'
                  ?'ci¢n de las sanciones pertinentes, incluidas en el Decreto Ley 3485/63'
                  ?'Capitulo V - R‚gimen Disciplinario, Articulo 34§ y 35§'
                  ?
                  ?'                         Saludamos a Ud. muy atentamente.-'
                  wcopias=wcopias-1
                  eject
               enddo
               select 7
               use spnotif
               append blank
               replace nro    with wnota
               replace fecha  with date()
               replace orden  with worden
               replace tipo   with 1
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
   