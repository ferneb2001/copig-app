procedure spcl05
*listado de cant.de certif. por titulo             
*   selecc. departamentos y categ.
@04,01 clear to 23,78
@04,28 say 'CONTEO DE CERTIFICADOS  POR TITULO'
wfede={  /  /  }
wfeha={  /  /  }
set date to dmy
wfecha=date()
wofi=0
@06,10 say 'Indique Fecha Inicial: '
@07,10 say 'Indique Fecha Final  : '
@06,50 get wfede
@07,50 get wfeha
@08,10 say 'Oficina (0=todas 1,2,3):'
@08,50 get wofi pict '9'
read
wtemp=0
set talk off
select 3
set exclusive on
set safety off
use spestad 
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(35)
whabi=' '
wcatego='  '
wcanca=0
wcancb=0
wcancd=0
wtitulo=space(3)
wnuind=0
select 5
use sptitu order titulo
do arma
@23,01 clear to 23,78
wkey=space(7)
select 2
use spcerxx
go top
index on str(cematri,5)+cecateg to spcifmc
select 2
use spcerxx index spcifmc
go top
set clock on
do while .not. eof()
   @15, 20 say cefecha
   @15, 30 say cecerti
   if cefecha >= wfede
      if cefecha <= wfeha
      wlista=0
       if wofi = 0
          wlista = 1
       else
          if wofi = ceofici
             wlista = 1
          endif
       endif
       if wlista = 1         
         if cecateg = 'EM'
            wtemp=wtemp+1
            wlista=0
         else
            wkey=str(cematri,5)+cecateg   
            select 1
            use spmatri index spmatri
            seek(wkey)
            if found()
             	if catego='A '
             		wcanca=wcanca+1
             		wlista=0
             	else
             		if catego='B1' or catego='B2' or catego='C '
             			wcancb=wcancb+1
             		else
             			wcancd=wcancd+1
             		endif
             	endif
             	if wlista=1
             		if b.ceobdpto=16 or b.ceobdpto=17 or b.ceobdpto=18 
              			 do armasu
              		endif	 
              	endif 
            endif   
         endif
       endif     
      endif
   endif
   select 2
   skip         
enddo   
*@12,01 clear to 12,78       
@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
select 3
sort to spestads on nomtit 
do imprime
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
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
   do while .not. eof()
      if wlin > 66
            do titulos
      endif
      if habili<>0   
         ?nomtit 
         ??habili pict '99999' at 50
         whabili= whabili+habili
         wlin=wlin+1
      endif
      skip
   enddo
   ? '  S U B  T O T A L     '
   ?? whabili pict '99999' at 50
   ?
   ? 'EMPRESAS   '
   ?? wtemp pict '99999' at 50
   whabili=whabili+wtemp
   ?
   ? '  T O T A L     '
   ?? whabili pict '99999' at 50
   ?
   ? ' Total categor¡a A  '
   ?? wcanca pict '99999' at 50
   ? ' Total Categor¡as B1,B2 y C '
   ?? wcancb pict '99999' at 50
   ? ' Total otras categor¡as '
   ?? wcancd pict '99999' at 50
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
?'CANTIDAD DE CERTIFICADOS POR TITULO ' AT 10
?? 'Fecha: ' at 48
?? wfecha 
?? ' HOJA NRO. ' at 64 
??whoja pict '999'
? 'Periodo desde: ' at 10
?? wfede
?? ' hasta: '
?? wfeha
if wofi = 0
   ?
else
   if wofi = 1
      ?'        Oficina: Mitre 617 '
   else
      if wofi=2
         ?'       Oficina: San Rafael '
      else
         if wofi = 3
            ?'       Oficina: San Mart¡n '
         else
            ?
         endif
      endif
   endif
endif                        
? '      TITULO                                  CANT.CERTIFICADOS     '
?? '         ' AT 70
wlin = 6
return

procedure arma
do while .not. eof()
   wnuind=recno()
   wnomtit=titplur
   wtitulo=titulo
   select 3
   append blank
   replace numind  with wnuind
   replace codtit with wtitulo
   replace nomtit with wnomtit
   replace inscri with 0
   replace habili with 0
   replace carnde  with 0
   replace fallec with 0
   select 5
   skip
enddo
select 3
use spestad
index on codtit to spestai
return

procedure armasu
wtitulo=titulo
whabili=0
wcarne=0
wfallec=0
winscri=1
*if habili > 1991 .and. condic < '2'
   whabili=1
*endif
*if condic = '2'
*   wcarne=1
*endif
*if condic = '3'
*   wfallec=1
*endif
select 3
use spestad index spestai
seek(wtitulo)
if found()
*   replace inscri with inscri+winscri
   replace habili with habili+whabili
*   replace carnde  with carnde+wcarne
*   replace fallec with fallec+wfallec
endif
return            