procedure spalpstq
*listado de profesionales por titulo (cantidades)
@04,01 clear to 23,78
@04,28 say 'CONTEO DE PROFESIONALES POR TITULO'
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
wcata=0
wcatb=0
wtitulo=space(3)
wnuind=0
set date to dmy
wfecha=date()
select 5
use sptitu order titulo
do arma
@23,01 clear to 23,78
select 1
use spmatri
go top
set clock on
@14,21 to 16,57
@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
do while .not. eof()
   if condic='5' or condic='3' or condic='4'
   else
     do armasu
   endif  
     select 1
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
   do while .not. eof()
      if wlin > 66
            do titulos
      endif
      if INSCRI <> 0   
         ?nomtit 
*         ??inscri pict '99999' at 40 
         ??habili pict '99999' at 50
*         ??carnde  pict '99999' at 60
*         ??fallec pict '99999' at 70
         winscri= winscri+inscri
         whabili= whabili+habili
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
*   ? winscri pict '99999' at 40
   ? whabili pict '99999' at 50
*   ?? wcarne pict  '99999' at 60
*   ?? wfallec pict '99999' at 70
   ?
*   ? ' Total Categor¡a A : '
*   ?? wcata pict '99999' at 30
*   ? ' Total Categor¡a B1: '
*   ?? wcatb pict '99999' at 30
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
?'CANTIDAD DE PROFESIONALES POR TITULO ' AT 20
?? 'Fecha: ' at 95
?? wfecha 
?? ' HOJA NRO. ' at 110
??whoja pict '999'
?
? '      TITULO                                   HABILITADOS          '
*? '      TITULO                        INSCRIPTOS HABILITADOS CARN.DEP.'
*?? ' FALLEC. ' AT 70
wlin = 5
return

procedure arma
do while .not. eof()
   wnuind=recno()
   wnomtit=titplur
   wtitulo=titulo
   wpadron=tipadron
*   if tipadron <> 'A'
      select 3
      append blank
      replace numind  with wnuind
      replace codtit with wtitulo
      replace nomtit with wnomtit
      replace padron with wpadron
      replace inscri with 0
      replace habili with 0
      replace carnde  with 0
      replace fallec with 0
*   endif   
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
wkey2=str(dctipo,1)+str(dcnro,8)
if catego='A '
	select 5
	use spprof index spprof.idx
	seek(wkey2)
	if found()
   		select 1
		wtitulo=titulo
		whabili=0
		wcarne=0
		winscri=0
		wfallec=0
		if fectit<>{  /  /    }
			if condic='1'
				winscri=1
			else
			   whabili=1	
			endif   
		else
			if condic='1'
				wcarne=1
			else
				wfallec=1
			endif	
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
	endif	
endif
select 1
return            