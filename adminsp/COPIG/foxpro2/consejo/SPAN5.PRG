procedure span5
* Notificaciones (modelo n§ 5) a Municipalidades (Present¢ Cert.H.P)
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
@04,05 say 'NOTIFIC. NOTA NRO.5 A MUNICIPALIDADES'
@04,45 say 'COMUNICA PRESENTO CERTIF.H.PROF.  '
@06,01 say 'Matricula:       Categor¡a:    Nombre:'
@08,01 say 'Nota N§:         Citese Expte N§     :'
@09,01 say 'Fecha de Comunicacion Municip.: '
@10,01 say 'Expediente Municipal  :'
@12,01 say 'Num.Certif.H.Profes.  :'
@14,01 say 'Fecha presentacion Cert:'
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
         wexpte=space(12)
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
         @08,40 get wexpte pict '!!!!!!!!!!!!'
         @09,40 get wfechle
         read
         wexptes=space(12)
         wfecer={  /  /  }
         wcertif=0
         wmunic=space(3)
         wobs1=space(69)
         wobs2=space(69)
         wobs3=space(69)
         wobs4=space(69)
         @10,25 get wexptes
         @12,25 get wcertif pict '9999999'
         @14,25 get wfecer
         read
         @15,01 say 'Observaciones:'
         @16,08 get wobs1
         @17,08 get wobs2
         @18,08 get wobs3
         @19,08 get wobs4
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
*         read
         @20,25 say wnomdpto
*         wnomunic=space(15)
*         wnumunic=1
         wop=1
         @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=1
            @23,01 clear to 23,78
            wop2=1
            @23,30 get wop2 pict '@*H \<Epson;\<Laser' size 1,1
            read
            if wop2=1
*               ?? chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
*            endif
            set printer to lpt1
            set console off
            set printer on
            set device to printer
            _ploffset=10
*            wcopmun=18
            wcopmun=1
            do while wcopmun>0
               wcopias=2
               do while wcopias>0
*                  ??CHR(27)+CHR(15)
*                  ??chr(27)+chr(18)
                  ?'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
                  ?'Decreto Ley N§ 3485/63  -  Ley N§ 5908  y  Ley  N§ 6377'
                  ?'Av.Mitre 617 - Tel.239178'
                  ?'5500    -   M E N D O Z A'
                  ?
                  ?'NOTA N§'
                  ??chr(27)+chr(71)
                  ??wnota pict '99999' at 09
                  ??chr(27)+chr(72)
                  ?'CITESE: Expte.N§'
                  ??chr(27)+chr(71)
                  ??wexpte pict 'XXXXXXXXXX' at 18
                  ??chr(27)+chr(72)
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
                  ?'Se¤or/a:'
                  ??chr(27)+chr(71)
                  ?'Director/a de    '
                  ?'Obras Privadas de la'
                  ?'MUNICIPALIDAD DE '
				  ?? wnomdpto
                  ?'S__________/_________D. '
                  ??chr(27)+chr(72)
                  ?
                  ?
                  ?'                         REF.: Expte. Municipal N§: '
                  ??wexptes
                  ?
                  ?
                  ?
                  ?
                  ?'                         En  contestaci¢n a su  comunicaci¢n de fecha'
                  ? wfechle
                  ?? ', nos dirigimos a Ud., a efectos de comunicarle que el:      '
                  ?' * '
                  ?? wnomtit
                  ??' D.: '
                  ??wnombre
                  ?' *            Matr¡cula N§ ' 
                  ??wmatri pict '99999'
                  ??'    Categor¡a: ' 
                  ??wcateg
                  ?'present¢  Certificado  de  Habilitaci¢n  Profesional  bajo  el n£mero'
                  ? wcertif pict '9999999'
                  ??' con fecha  '
                  ?? wfecer
                  ??', seg£n informe de Sec. Certificaci¢n de'
                  ?'Habilitaci¢n Profesional. Se adjunta fotocopia del mismo, para  cons-'
                  ?'tancia.-  '
                  if wobs1<>space(69)
                     ?wobs1
                  endif   
                  if wobs2<>space(69)
                     ?wobs2
                  endif   
                  if wobs3<>space(69)
                     ?wobs3
                  endif   
                  if wobs4<>space(69)
                     ?wobs4
                  endif   
                  ?
                 ??chr(27)+chr(72)
                 ?'n5                       Con tal motivo lo/la saludamos muy atte.- '
                 
                 wcopias=wcopias-1
                 eject
              enddo
              wcopmun=wcopmun-1
            enddo
            else   
              if wop2=2
                 set printer to lpt1
                 set console off
                 set printer on
                 set device to printer
                 _ploffset=8 
                 ?? chr(027)+chr(038)+chr(108)+chr(050)+chr(054)+chr(065)
                 ?? chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
                 wcopmun=1
                 do while wcopmun>0
                    wcopias=2
                    do while wcopias>0
                       ?'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
                       ?'Decreto Ley N§ 3485/63  -  Ley N§ 5908  y  Ley  N§ 6377'
                       ?'Av.Mitre 617 - Tel.239178'
                       ?'5500    -   M E N D O Z A'
                       ?
                       ?'NOTA N§'
*                       ??chr(27)+chr(71)
                       ??wnota pict '99999' at 09
*                       ??chr(27)+chr(72)
                       ?'CITESE: Expte.N§'
*                       ??chr(27)+chr(71)
                       ??wexpte pict 'XXXXXXXXXX' at 18
*                       ??chr(27)+chr(72)
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
                       ?'Se¤or/a:'
*                       ??chr(27)+chr(71)
                       ?'Director/a de    '
                       ?'Obras Privadas de la'
                       ?'MUNICIPALIDAD DE '
                       ?? wnomdpto
                       ?'S__________/_________D. '
*                       ??chr(27)+chr(72)
                       ?
                       ?
                       ?'                         REF.: Expte. Municipal N§: '
                       ??wexptes
                       ?
                       ?
                       ?
                       ?
                       ?'                         En  contestaci¢n a su  comunicaci¢n de fecha'
                       ? wfechle
                       ?? ', nos dirigimos a Ud., a efectos de comunicarle que el:      '
                       ?' * '
                       ?? wnomtit
                       ??' D.: '
                       ??wnombre
                       ?' *            Matr¡cula N§ ' 
                       ??wmatri pict '99999'
                       ??'    Categor¡a: ' 
                       ??wcateg
                       ?'present¢  Certificado  de  Habilitaci¢n  Profesional  bajo  el n£mero'
                       ? wcertif pict '9999999'
                       ??' con fecha  '
                       ?? wfecer
                       ??', seg£n informe de Sec. Certificaci¢n de'
                       ?'Habilitaci¢n Profesional. Se adjunta fotocopia del mismo, para  cons-'
                       ?'tancia.-  '
                       if wobs1<>space(69)
                          ?wobs1
                       endif   
                       if wobs2<>space(69)
                          ?wobs2 
                       endif   
                       if wobs3<>space(69)
                          ?wobs3
                       endif   
                       if wobs4<>space(69)
                          ?wobs4
                       endif   
                       ?
*                      ??chr(27)+chr(72)
                      ?'n5                       Con tal motivo lo/la saludamos muy atte.- '
                 
                      wcopias=wcopias-1
                      eject
                   enddo
                   wcopmun=wcopmun-1
                 enddo   
            endif
         endif   
*            enddo
            endif   
            select 7
            use spcedul
            append blank
            replace ce_nro    with wnota
            replace ce_fecha  with date()
            replace ce_orden  with wexpte
            replace ce_tipo   with 5
            replace ce_nota   with 0
            replace ce_matri  with wmatri
            replace ce_categ  with wcateg
            replace ce_fprov  with space(23)
            replace ce_enc1   with wobs1
            replace ce_enc2   with wobs2
            replace ce_enc3   with wobs3
            replace ce_enc4   with wobs4
            replace ce_enc5   with space(75)
            replace ce_enc6   with space(75)
            replace ce_fenot  with {  /  /  }
            replace ce_op2    with 2
            ce_xcod=space(1)
            ce_xnro=0
            ce_xano=0
            replace ce_munic  with wnomdpto
            replace ce_exptemu with wexptes
            replace ce_femuni  with wfechle
            replace ce_legtco  with wcertif
            replace ce_fecert  with wfecer
           *eject
           _ploffset=0
           set printer off
           set device to screen
         endif  
*      else
*           @06, 40 say 'No existe'  
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