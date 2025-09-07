procedure spalpst8
*listado de profesionales por padron y por titulo (cantidades)
*   con spestads creado
@04,01 clear to 23,78
@04,28 say 'CONTEO DE PROFESIONALES POR PADRON Y POR POR TITULO'
set talk off
select 3
set exclusive on
set safety off
use spestad 
*zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(35)
whabi=' '
wcatego='  '
wtitulo=space(3)
wnuind=0
set date to ymd
wfecha=date()
*select 5
*use sptitu order titulo
*do arma
@23,01 clear to 23,78
*select 1
*use spmatri
*go top
set clock on
@14,21 to 16,57
*@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
*do while .not. eof()
*   do armasu
*   select 1
*   skip
*enddo
@12,01 clear to 12,78       
@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
select 3
sort to spestads on padron, nomtit 
do imprime
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
set date to dmy
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 4
   use spestads
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
   wlin=90
   whoja=0
   winscri=0
   whabili=0
   wcarne=0
   wfallec=0
   tpinsc=0
   tphabi=0
   tptinsc=0
   tpthabi=0
   wtipad=space(35)
   wpadron='1'
   do while .not. eof()
      if wlin > 66
            do titulos
      endif
      if INSCRI <> 0
         if wpadron <> padron
            do case
               case wpadron = '1'
                    wtipad=' Total INGENIERIA CIVIL '
               case wpadron = '2'
                    wtipad=' Total INGENIERIA ESPECIALIZADA'     
               case wpadron = '3'
                    wtipad=' Total INGENIERIA AGRONOMICA'
               case wpadron = '5'
                    wtipad=' Total G E O L O G I A '     
               case wpadron = '7'
                    wtipad=' Total TECNICOS INDUSTIALES  '     
               case wpadron = '9'
                    wtipad=' Total CONSTRUCTORES     '
               case wpadron = 'A'
                    wtipad=' Total OTRAS ESPECIALIDADES ' 
             endcase  
             ?
             ? wtipad at 10
             ?? tpinsc pict '99999' at 60
             ?? tphabi pict '99999' at 70   
             ?
             tpinsc=0
             tphabi=0
             wpadron=padron
             wlin=wlin+3
         endif   
         ?nomtit 
         ??inscri pict '99999' at 60 
         ??habili pict '99999' at 70
*         ??carnde  pict '99999' at 60
*         ??fallec pict '99999' at 70
         winscri= winscri+inscri
         whabili= whabili+habili
         tphabi=tphabi+habili
         tpinsc=tpinsc+inscri
         tptinsc=tptinsc+inscri
         tpthabi=tpthabi+habili
         wcarne = wcarne+carnde
         wfallec= wfallec+fallec
         wlin=wlin+1
      endif
    *  if wlin > 66
    *     do titulos
    *   endif
       skip
   enddo
*   ???chr(27)+chr(18)
*    ???chr(27)+chr(50)
*    ???chr(27)+chr(80)
   ?
   ? '           Total OTRAS ESPECIALIDADES '
   ?? tpinsc pict '99999' at 60
   ?? tphabi pict '99999' at 70
   ?
   ? '  TOTAL GENERAL   '
   ?? winscri pict '99999' at 60
   ?? whabili pict '99999' at 70
*   ?? wcarne pict  '99999' at 60
*   ?? wfallec pict '99999' at 70
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
whoja=whoja+1
IF WHOJA<> 1
if wlin > 66
   eject
endif
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'CANTIDAD DE PROFESIONALES POR TITULO Y POR TIPO DE ESPECIALIDAD ' AT 10
? 'Fecha: ' at 35
?? wfecha 
?? ' HOJA NRO. ' at  60
??whoja pict '999'
?
? '      TITULO                                           INSCRIPTOS'
?? 'HABILITADOS' AT 66
wlin = 6
return

procedure arma
do while .not. eof()
   wnuind=recno()
   wnomtit=titplur
   wtitulo=titulo
   if tipadron = '6'
      tipadron = '2'
   else
      if tipadron = '8' or tipadron = 'Z'
         tipadron = 'A'
      endif
   endif         
   wtipadron=tipadron
   if tipadron <> ' '
      select 3
      append blank
      replace numind  with wnuind
      replace codtit with wtitulo
      replace nomtit with wnomtit
      replace inscri with 0
      replace habili with 0
      replace carnde  with 0
      replace fallec with 0
      replace padron with wtipadron
   endif   
   select 5
   skip
enddo
select 3
use spestad
index on codtit to spestai
return

procedure armasu
@10,10 say numero
@10,15 say catego
@10,20 say titulo
wtitulo=titulo
whabili=0
wcarne=0
wfallec=0
winscri=0
if condic < '3'
   winscri=1
endif   
*if habili > 1996
*   whabili=0
*else
*   if habili > 1991 .and. condic < '2' .and pago < {97/01/01}
   if habili > 1991 .and. condic < '2' 
      whabili=1
   endif
*endif   
if condic = '2'
   wcarne=1
endif
if condic = '3'
   wfallec=1
endif
select 3
use spestad index spestai
seek(wtitulo)
if found()
   replace inscri with inscri+winscri
   replace habili with habili+whabili
   replace carnde  with carnde+wcarne
   replace fallec with fallec+wfallec
endif
return            