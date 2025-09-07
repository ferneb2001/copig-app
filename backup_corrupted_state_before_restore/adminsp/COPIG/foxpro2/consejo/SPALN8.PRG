procedure spaln8
* Notificaciones (nota nro 3) a Municipalidades    
* Informa los profesionales sancionados desde arch. spsancv
*  creado con copia  de spsanc para selecionar registros a listar
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
dimension wexpc(18), wexpm(18), wmatri(18), wcateg(18), wnombre(18), wnomtit(18), wnomdpto(18)
dimension wtitulo(18), wfecha(18), wresol(18)
wtitulo=space(36)
wresol=space(144)
wexpc=space(108)
wexpm=space(144)
wcateg=space(24)
wnombre=space(30)
wnomtit=space(30)
wnomdpto=space(14)
store space(12) to wresol(1)
store space(12) to wresol(2)
store space(12) to wresol(3)
store space(12) to wresol(4)
store space(12) to wresol(5)
store space(12) to wresol(6)
store space(12) to wresol(7)
store space(12) to wresol(8)
store space(12) to wresol(9)
store space(12) to wresol(10)
store space(12) to wresol(11)
store space(12) to wresol(12)
store {  /  /  } to wfecha(1)
store {  /  /  } to wfecha(2)
store {  /  /  } to wfecha(3)
store {  /  /  } to wfecha(4)
store {  /  /  } to wfecha(5)
store {  /  /  } to wfecha(6)
store {  /  /  } to wfecha(7)
store {  /  /  } to wfecha(8)
store {  /  /  } to wfecha(9)
store {  /  /  } to wfecha(10)
store {  /  /  } to wfecha(11)
store {  /  /  } to wfecha(12)
store 0 to wmatri(1), wmatri(2), wmatri(3), wmatri(4), wmatri(5), wmatri(6)
store 0 to wmatri(7), wmatri(8), wmatri(9), wmatri(10), wmatri(11), wmatri(12)
@04,01 clear to 23,78
@04,20 say 'NOTIFICACIONES NOTA NRO.3  A MUNICIPALIDADES (Mensual)'
@05,50 say 'datos tomados del archivo de sanciones'
@06,01 say 'Nota N§:        '
*@08,01 say 'Matr¡-     Exped.     Exped.       Municipa-     Fecha       Resoluciones'
*@09,01 say 'cula  Cat. Consejo    Municipal     lidad      Suspensi¢n'
select 2
use spprof index spprof
select 1
use spmatri index spmatri
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
select 6
use sptitu order titulo
select 7
use spsancv index spsancv
set exclusive on
select 8
use sptmsan
zap
set exclusive off
wkey=space(7)
wkey1=space(9)
WSENA=0
WNOTA=0
wmatri=0
WCPOST=SPACE(4)
wsigue='S'
wnombre=space(30)
wcateg=space(2)
do while wsigue='S'
   wexpte=space(10)
   @23,01 say 'Indique nro. nota o 99999 para terminar'
   @06,10 get wnota pict '99999'
   read
   @23,01 clear to 23,78
   wind=1
   wlin=11
   if wnota<>99999
      select 7
      go top
      do while not eof()
         wposcu=0
         if sancpag = 0
*            if santipo = '1' 
*               if saninci = 'f' or saninci = 'F' or saninci = 'e' or saninci = 'E'
*                  wposcu = 1
*               else
*                  wposcu=0
*               endif   
*            else
               if santipo = '5'
                  wposcu=1
               else
                  wposcu=0
               endif
*            endif      
         else
            wposcu=0
         endif
         if wposcu = 1         
            wkey=str(matric,5)+catego
            select 1
            seek(wkey)
            if found()
               wkey1=str(dctipo,1)+str(dcnro,8)
               wtitulo(wind)=titulo
               select 2
               seek(wkey1)
               if found()
                  wnombre=nombre
*                  worden=space(12)
                  @06,40 say nombre
                  select 6
                  seek(a.titulo)
                  if found()
                     wnomtit=titdesc
                  else
                     wnomtit=space(30)
                  endif
                  select 8
                  append blank
                  replace numero  with a.numero
                  replace catego  with a.catego
                  replace titulo  with a.titulo
                  replace inciso  with g.saninci
                  replace dctipo  with b.dctipo
                  replace dcnro   with b.dcnro
                  replace habili  with a.habili
                  replace condic  with a.condic
                  replace nombre  with wnombre
                  replace tipo    with g.santipo
                  replace resoluc with g.sanresol
                  replace fresol  with g.sanferes
                  replace finic   with g.sanvigde
                  replace ffinal  with g.sanvigha
                  replace canmatr with g.sancnmat
                  replace codpag  with g.sancpag
                  replace fpago   with g.sanfpag
                  replace recibo  with g.sanreci
                  replace importe with g.sanimpo
                  replace observ  with g.sanobs
                  replace nomtit  with wnomtit
               endif
            endif
         endif
         select 7
         skip
      enddo            
*if wsena=1 
      wnomunic=space(15)
      wnumunic=1
      wop=1
*    para prueba se coloca 1 en copias
*      wcop=1     
      wcop=3
*     wcop=(wind-1)*2
      @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
      read
      @23,01 clear to 23,78
      if wop=1
      	 select 8
       	 sort to sptmsans on nombre
       	 set safety on
       	 use sptmsans
       	 go top
         set printer to lpt1
         set console off
         set printer on
         set device to printer
*     para prueba se coloca 1 en municipalidades
*          wcopmun=1         
         wcopmun=18
         do while wcopmun>0
            wcopias=wcop
            do while wcopias>0
            ??chr(18)
            ?'CONSEJO  PROFESIONAL  DE  INGENIEROS  Y  GEOLOGOS'
            ?'Decreto Ley   3485/63 - Ley N§ 5908 y Ley N§ 6377'
            ?'Av.Mitre 617 - Tel.239178'
            ?'5500    -   M E N D O Z A'
            ?
            ?'NOTA N§'
*                        ??chr(27)+chr(71)
*                        ??wnota pict '99999' at 09
*                        ??chr(27)+chr(72)
            ?'CITESE: Expte(s).N§'
*                        ??chr(27)+chr(71)
*                        ??wexpc(1)+' '+wexpc(2)+' '+wexpc(3)+' '+wexpc(4) at 20
*                        ? wexpc(5)+' '+wexpc(6)+' '+wexpc(7)+' '+wexpc(8) at 20
*                        ? wexpc(9)+' '+wexpc(10)+' '+wexpc(11) at 20
*                        ??chr(27)+chr(72)
*                        ?
*                        ?
            ?'MENDOZA,' at 33
            ??day(date()) pict '99' at 42
            ??' de '    at 45 
            ??wmeses(month(date())) at 49
            ??' de '    at 59
            ??year(date()) at 63
            ?
*                        ?
            ?'Al Se¤or:'
            ??chr(27)+chr(71)
            ?'INTENDENTE DE LA'
            ?'MUNICIPALIDAD DE'
            if wcopias = wcop
               do buscamun
            endif    
            ?wnomunic
            ??chr(27)+chr(72)
            ?wcpost
            ?? wnomunic at 7
*                        ?
*                        ?
            ?
            ?'                         REF.: Comunica Profesionales Suspendidos  '
*                        ?'   '
*                        ?'                       '
            ?'                       '
*                        ?'De nuestra consideraci¢n:'
            ?'                         Tenemos el agrado de  dirigirnos al Se¤or In-'
            ?'tendente, a efectos  de elevarle un  informe  mensual sobre los profe-'
            ?'sionales suspendidos en el ejercicio  profesional en todo el  mbito de'
            ?'la Provincia.  La  misma  ser  levantada una vez que haya dado cumpli-'
            ?'miento a lo establecido en el Decreto - Ley 3485/63 modificado por Ley'
            ?'5908/92.-'                                                              
*                        ?'por Ley 5908/92.-'
            ?
            ?'                         A continuaci¢n  se detallan los datos necesa-'
            ?'rios  para  conocimiento de ese  Municipio  y a los efectos que estime'
            ?'corresponder:'
            ?chr(15)
            ?' Profesional                   Matr.Cat.  T¡tulo                             Fecha     Observaciones                               '
            ?'                                                                          Suspensi¢n                                               '
            select 8
*                    	 sort to sptmsans on nombre
*                    	 set safety on
          	use sptmsans
            go top
            do while not eof()
*               if wlin>88
*                  do titulos
*               endif
*                        wind=1
*                        do while wind < 19
     			? nombre
	    		??numero at 35 pict '99999'
		    	??catego at 41
			    ??nomtit at 45
			    ??finic  at 77
			    ??observ at 88
*                           ?wexpc(wind)
*                           ??wexpm(wind) at 11
*                           ??wnomdpto(wind) at 25
*                           ??wnombre(wind) at 37
*                           ?? wnomtit(wind) at 67
*                           ?? wmatri(wind) at 97 pict '99999'
*                           ?? wcateg(wind) at 103
*                           ?? wfecha(wind) at 108
*                           ?? wresol(wind) at 119
*                           wind=wind+1
*                           if wmatri(wind)= 99999
*                              exit
*                           endif
			   skip   
            enddo   
            ?chr(18)
*                           ??CHR(27)+CHR(80)
*                           ??chr(27)+chr(72)
            ?
            ?'                         Con tal motivo, saludamos a Ud muy atte.-'
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
        set printer off
        set device to screen
     endif  
*         endif  
*      else
*           @06, 40 say 'No existe'  
*      endif
*    endif
*    enddo
   else
      wsigue='N'
   endif    
enddo
@04,01 clear to 23,78
close all
return

procedure buscamun
wcpost=space(4)
select 5
seek(wnumunic)   
if found()
   wnomunic=nombre
   wcpost=cpost
else
   wnomunic=space(15)
endif
wnumunic=wnumunic+1
return   


*      do while wmatri(wind)<>99999
         wmatri(wind)=0
         wcateg(wind)=space(2)
*         @23,01 say 'Indique Nro.de matricula o 99999 para salir'
*         @wlin,02 get wmatri(wind) pict '99999'
*         read
*         @23,01 clear to 23,78
         if wmatri(wind)<>99999
            @wlin,08 get wcateg(wind) pict '!!'
            read
                  select 1                  
                  wexpc(wind)=space(9)
                  wexpm(wind)=space(12)
                  @wlin,11 get wexpc(wind)
                  @wlin,22 get wexpm(wind)
                  read
                  @23,01 SAY 'Seleccione Municipalidad y oprima <ESC>'
                  define window pdpto from 17,55 to 22,77
                  activate window pdpto
                  select 5
                  brow in window pdpto
                  deactivate window pdpto
                  @23,01 clear to 23,78
                  wnomdpto(wind)=nombre
*               wmunic(wind)=dpto
                  @wlin,36 say wnomdpto(wind)
                  @wlin,50 get wfecha(wind)
                  @wlin,60 get wresol(wind)
                  read
                  wise=wind
                  wlin=wlin+1
                  wind=wind+1
*                  wmatri(wind)=99999
                  wsena=1
                  if wind>11
                     wmatri(wind)=99999
                     wsigue='N'
                  endif
*               endif
*            endif
         else
            wsigue='N'
         endif
*     enddo
*   endif
*enddo
