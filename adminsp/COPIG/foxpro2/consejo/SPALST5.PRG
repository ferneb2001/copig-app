procedure spalst5
*listado de profesionales por titulo (cantidades)
*   habilitados, por a¤o de matriculacion  1993 a 1997.          
@04,01 clear to 23,78
@04,8 say 'CONTEO DE PROFESIONALES  HABILITADOS POR TITULO y POR A¥O MATRIC'
@05,8 say 'Por zona geogr fica '
set talk off
dimension wtp01(5), wtp02(5), wtp03(5), wtp04(5), wtp05(5)
store 0 to wtp01(1), wtp01(2), wtp01(3), wtp01(4), wtp01(5)
store 0 to wtp02(1), wtp02(2), wtp02(3), wtp02(4), wtp02(5)
store 0 to wtp03(1), wtp03(2), wtp03(3), wtp03(4), wtp03(5)
store 0 to wtp04(1), wtp04(2), wtp04(3), wtp04(4), wtp04(5)
store 0 to wtp05(1), wtp05(2), wtp05(3), wtp05(4), wtp05(5)
windzo=0
*select 3
*set exclusive on
set safety off
*use spestad 
*zap
set exclusive off
whabi=' '
wop=1
wopc=0
wnomtit=space(35)
whabi=' '
wcatego='  '
wtitulo=space(3)
wnuind=0
set date to dmy
wfecha=date()
select 5
use sptitu order titulo
*do arma
@23,01 clear to 23,78
select 2
use spprof index spprofi
select 1
use spmatri
go top
set clock on
wcuenta=0
wcuento=0
@14,21 to 16,57
@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
do while .not. eof()
   @18,20 say numero
   @18,26 say catego
   wcuenta=wcuenta+1
   @18,35 say wcuenta pict '99999'
   @18,60 say inscr
   IF INSCR <> {  /  /  }
   ELSE
      IF FECHAB <>{  /  /  }
         INSCR=FECHAB
      ENDIF
   ENDIF
   if catego<>'CR'   
   if year(inscr) = 1989
*   if habili < 1992
      do armasu
      wcuento=wcuento+1
      @19,35 say wcuento pict '99999'
   endif   
   endif
   select 1
   skip
enddo
*@12,01 clear to 12,78       
*@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
*select 3
*sort to spestads on padron, nomtit 
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
*   select 4
*   use spestads
*   go top
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
   wotros=0
   wtotal=0
   wtop01=0
   wtop02=0
   wtop03=0
   wtop04=0
   do titulos
   windzo = 1
   ? 'Padron de Ingenier¡a Civil '
   ?? wtp01(1) pict '99999' at 34
   ?? wtp01(2) pict '99999' at 40
   ?? wtp01(3) pict '99999' at 46
   ?? wtp01(4) pict '99999' at 54
   ?? wtp01(5) pict '99999' at 62
   wtotal=wtp01(1)+wtp01(2)+wtp01(3)+wtp01(4)+wtp01(5)
   ?? wtotal   pict '99999' at 70
      winscri= winscri+wtp01(1)
      whabili= whabili+wtp01(2)
      wcarne = wcarne+wtp01(3)
      wfallec= wfallec+wtp01(4)
      wotros = wotros+ wtp01(5)
      wlin=wlin+1
   ? 'Padron de Ingenier¡a Especializada '
   ?? wtp02(1) pict '99999' at 34
   ?? wtp02(2) pict '99999' at 40
   ?? wtp02(3) pict '99999' at 46
   ?? wtp02(4) pict '99999' at 54
   ?? wtp02(5) pict '99999' at 62
   wtotal=wtp02(1)+wtp02(2)+wtp02(3)+wtp02(4)+wtp02(5)
   ?? wtotal   pict '99999' at 70
      winscri= winscri+wtp02(1)
      whabili= whabili+wtp02(2)
      wcarne = wcarne+wtp02(3)
      wfallec= wfallec+wtp02(4)
      wotros = wotros+ wtp02(5)
      wlin=wlin+1
   ? 'Padron de Ingenier¡a Agronomica'
   ?? wtp03(1) pict '99999' at 34
   ?? wtp03(2) pict '99999' at 40
   ?? wtp03(3) pict '99999' at 46
   ?? wtp03(4) pict '99999' at 54
   ?? wtp03(5) pict '99999' at 62
   wtotal=wtp03(1)+wtp03(2)+wtp03(3)+wtp03(4)+wtp03(5)
   ?? wtotal   pict '99999' at 70
      winscri= winscri+wtp03(1)
      whabili= whabili+wtp03(2)
      wcarne = wcarne+wtp03(3)
      wfallec= wfallec+wtp03(4)
      wotros = wotros+ wtp03(5)
      wlin=wlin+1
   ? 'Padron de Geolog¡a   '
   ?? wtp04(1) pict '99999' at 34
   ?? wtp04(2) pict '99999' at 40
   ?? wtp04(3) pict '99999' at 46
   ?? wtp04(4) pict '99999' at 54
   ?? wtp04(5) pict '99999' at 62
   wtotal=wtp04(1)+wtp04(2)+wtp04(3)+wtp04(4)+wtp04(5)
   ?? wtotal   pict '99999' at 70
      winscri= winscri+wtp04(1)
      whabili= whabili+wtp04(2)
      wcarne = wcarne+wtp04(3)
      wfallec= wfallec+wtp04(4)
      wotros = wotros+ wtp04(5)
      wlin=wlin+1
   ? 'Otros Padrones             '
   ?? wtp05(1) pict '99999' at 34
   ?? wtp05(2) pict '99999' at 40
   ?? wtp05(3) pict '99999' at 46
   ?? wtp05(4) pict '99999' at 54
   ?? wtp05(5) pict '99999' at 62
   wtotal=wtp05(1)+wtp05(2)+wtp05(3)+wtp05(4)+wtp05(5)
   ?? wtotal   pict '99999' at 70
      winscri= winscri+wtp05(1)
      whabili= whabili+wtp05(2)
      wcarne = wcarne+wtp05(3)
      wfallec= wfallec+wtp05(4)
      wotros = wotros+ wtp05(5)
      wlin=wlin+1
   ? 'Totales                    '
   ?? winscri  pict '99999' at 34
   ?? whabili  pict '99999' at 40
   ?? wcarne   pict '99999' at 46
   ?? wfallec  pict '99999' at 54
   ?? wotros   pict '99999' at 62
   wtotal=winscri+whabili+wcarne+wfallec+wotros
   ?? wtotal   pict '99999' at 70
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
?'CANTIDAD DE PROFESIONALES POR TITULO, MATRICULADOS   ' AT 20
? '                       1989 '
?? 'Fecha: ' at 40
?? wfecha 
?? ' Hoja Nro. ' at 60
??whoja pict '999'
?
? '      PADRON                      G.Mza. Este  Centro   Sur   Otras P.'
?? 'TOTAL    ' AT 70
wlin = 6
return

procedure arma
do while .not. eof()
   wnuind=recno()
   wnomtit=titplur
   wtitulo=titulo
   wpadron=tipadron
   select 3
   append blank
   replace numind  with wnuind
   replace codtit with wtitulo
   replace nomtit with wnomtit
   replace inscri with 0
   replace habili with 0
   replace carnde  with 0
   replace fallec with 0
   replace otro  with 0
   replace padron with wpadron
   select 5
   skip
enddo
select 3
use spestad
index on codtit to spestai
return

procedure armasu
wtitulo=titulo
wkey1=space(9)
wkey1=str(dctipo,1)+str(dcnro,8)
select 2
use spprof index spprofi
seek(wkey1)
if found()
	if provin < 2
		if dpto < 8
			windzo=1
		else
			if dpto < 13
				windzo=2
			else
				if dpto < 16
					windzo=3
				else
					if dpto < 19
						windzo=4
					endif
				endif
			endif
		endif
	else
		windzo=5
		@19,5 say ' otras provincias '
		@19,30 say a.numero 
		@19,36 SAY a.catego
*		@19,55 get wopc
*		read
	endif
@05, 10 say a.inscr
@06, 10 say year(a.inscr)
wop=0
select 5
seek(wtitulo)
if found()
	if tipadron = '1'
		wtp01(windzo)=wtp01(windzo)+1
	else
		if tipadron='2'
			wtp02(windzo)=wtp02(windzo)+1
		else
			if tipadron='3'
				wtp03(windzo)=wtp03(windzo)+1
			else
				if tipadron='5'
					wtp04(windzo)=wtp04(windzo)+1
				else
					wtp05(windzo)=wtp05(windzo)+1
				endif
			endif
		endif
	endif
endif
endif
return            