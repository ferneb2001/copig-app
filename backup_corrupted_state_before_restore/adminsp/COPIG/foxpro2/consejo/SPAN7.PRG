procedure span7
* Notificaciones (nota nro 7) a Municipalidades    
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
@04,05 say 'NOTIFIC. NOTA NRO.7 A MUNICIPALIDADES'
@04,45 say 'Remitir Fotocopia Resoluci¢n    '
*@06,01 say 'Matricula:       Categor¡a:    Nombre:'
@08,01 say 'Nota N§:         Citese Expte N§     :'
*@09,01 say 'Fecha de Levantamiento susp.: '
@10,01 say 'Resoluci¢n Consejo N§ :'
*@12,01 say 'Expediente/s Municipal/es :'
*@14,01 say 'de la Municipalidad de:'
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
wfechle={  /  /  }
   wnota=0
   wexpte=space(10)
   worden=space(12)
   @23,01 say 'Para salir Nota=99999'
   @08,10 get wnota pict '99999'
   @08,40 get wexpte pict '!!!!!!!!!!'
   read
   do while wnota <> 99999
*   if wnota <> 99999
      @23,01 clear to 23,78   
      wexptes=space(6)
      @10,25 get wexptes
      read
      if lastkey()<>27
         wnomunic=space(15)
         wnumunic=1
         wop=1
         @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=3
            wnota=99999
         else   
         if wop=1
            @23,01 clear to 23,78
            wop2=1
            @23,30 get wop2 pict '@*H \<Epson;\<Laser' size 1,1
            read
            if wop2=2
               ?? chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
            endif   
            set printer to lpt1
            set console off
            set printer on
            set device to printer
            _ploffset=10
            wcopmun=18
            do while wcopmun>0
               wcopias=2
               do while wcopias>0
                  ??chr(27)+chr(18)
                  ?'CONSEJO  PROFESIONAL  DE  INGENIEROS  Y  GEOLOGOS'
                  ?'Decreto  Ley  3485/63 - Ley N§ 5908 y Ley N§ 6377'
                  ?'Av.Mitre 617 - Tel.239178'
                  ?'5500    -   M E N D O Z A'
                  ?
                  ?
                  ?'NOTA N§ '
                  ??chr(27)+chr(71)
                  ??wnota pict '99999'
                  ??chr(27)+chr(72)
                  ?'CITESE: Expte.N§ '
                  ??chr(27)+chr(71)
                  ??wexpte pict 'XXXXXXXXXX' 
                  ??chr(27)+chr(72)
                  ?
                  ?
                  ?
                  ?'MENDOZA,' at 32
                  ??day(date()) pict '99' at 41
                  ??' de '    at 44 
                  ??wmeses(month(date())) at 48
                  ??' de '    at 58
                  ??year(date()) at 62
                  ?
                  ?
                  ? 
                  ?'Al Se¤or:'
                  ??chr(27)+chr(71)
                  ?'INTENDENTE DE LA'
                  ?'MUNICIPALIDAD DE'
                  if wcopias = 2
                     do buscamun
                  endif    
                  ?wnomunic
                  ??chr(27)+chr(72)
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'                              REF.: Remitir fotocopia autorizada de '
                  ?'                                    Resoluci¢n N§: '
                  ??wexptes pict 'XXXXXX'
                  ?
                  ?
                  ?
                  ?
                  ?'                         Tenemos el agrado de dirigirnos al Se¤or In-'
                  ?
                  ?'tendente, a  fin de hacerle llegar adjunto, para conocimiento y dem s'
                  ?
                  ?'efectos, fotocopia autorizada de la Resoluci¢n N§ '
                  ??chr(27)+chr(71)
                  ?? wexptes pict 'XXXXXX'
                  ??chr(27)+chr(72)
                  ??' oportunamen- '
                  ?
                  ?'te dictada por este Consejo.-'
                  ?
                  ?
                  ?'n7                       Con tal motivo, hacemos  propicia la oportu-'
                  ?
                  ?'nidad para saludarlo con atenta consideraci¢n.-'
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'Adj.: una (1)'
                 
                 wcopias=wcopias-1
                 eject
              enddo
              wcopmun=wcopmun-1
            enddo   
*           select 7
*           use spnotmu
*           append blank
*           replace nro    with wnota
*           replace fecha  with date()
*           replace orden  with worden
*           replace tipo   with 1
*           replace expte  with wexpte
*           replace matri  with wmatri
*           replace categ  with wcateg
*           replace exptes with wexptes
*           replace ante   with wante
           *eject
           _ploffset=0
           set printer off
           set device to screen
         endif  
*      else
*           @06, 40 say 'No existe'  
       endif
     endif
     wnota=99999
*  endif    
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