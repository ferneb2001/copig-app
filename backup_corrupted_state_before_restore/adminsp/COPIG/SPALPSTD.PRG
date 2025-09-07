procedure spalpstd
*listado de profesionales por titulo (cantidades)
*con discriminacion de delegaciones
@04,01 clear to 23,78
@04,28 say 'CONTEO DE PROFESIONALES POR TITULO'
set talk off
select 3
set exclusive on
set safety off
use spestadd 
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
set date to ymd
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
   do armasu
   select 1
   skip
enddo
*@12,01 clear to 12,78       
*@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
*select 3
*sort to spestads on nomtit 
*do imprime
@04,01 clear to 23,78
close all
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
      replace padron with wpadron
      replace inscri with 0
      replace habili with 0
      replace carnde  with 0
      replace fallec with 0
      replace ina1   with 0
      replace ina2   with 0
      replace ina3   with 0
      replace ina4   with 0
      replace haa1   with 0
      replace haa2   with 0
      replace haa3   with 0
      replace haa4   with 0
      replace cda1   with 0
      replace cda2   with 0
      replace cda3   with 0
      replace cda4   with 0
      replace faa1   with 0
      replace faa2   with 0
      replace faa3   with 0
      replace faa4   with 0
   select 5
   skip
enddo
select 3
use spestadd
index on codtit to spestai
return

procedure armasu
@10,10 say numero
@10,15 say catego
@10,20 say titulo
wkey2=str(dctipo,1)+str(dcnro,8)
if catego='A '
	select 2
	use spprof index spprof.idx
	seek(wkey2)
	if found()
   		select 1
		wtitulo=titulo
		whabili=0
		wcarne=0
		wfallec=0
		winscri=1
		wina1=0
		wina2=0
		wina3=0
		wina4=0
		whaa1=0
		whaa2=0
		whaa3=0
		whaa4=0
		wcda1=0
		wcda2=0
		wcda3=0
		wcda4=0
		wfaa1=0
		wfaa2=0
		wfaa3=0
		wfaa4=0
		if condic = '4' or condic = '5' or condic = '3'
		else
	       if b.provin<>1
	       		wina4=1
	       else
	          if b.dpto>0 and b.dpto<8
	          	wina1=1
	          else
	          	if b.dpto=13 or b.dpto=14 or b.dpto=15
	          		wina1=1
	          	else
	          		if b.dpto>7 and b.dpto<13
	          			wina2=1
	          		else
	          			if b.dpto=16 or b.dpto=17 or b.dpto=18
	          				wina3=1
	          			endif	
	          		endif	
	          	endif		
	          endif			
           endif
	    if habili > 2016 .and. condic < '2' 
           whabili=1
	       if b.provin<>1
	       		whaa4=1
	       else
	          if b.dpto>0 and b.dpto<8
	          	whaa1=1
	          else
	          	if b.dpto=13 or b.dpto=14 or b.dpto=15
	          		whaa1=1
	          	else
	          		if b.dpto>7 and b.dpto<13
	          			whaa2=1
	          		else
	          			if b.dpto=16 or b.dpto=17 or b.dpto=18
	          				whaa3=1
	          			endif	
	          		endif	
	          	endif		
	          endif			
           endif
		endif
		if condic = '2' or condic = '6'
		   wcarne=1
	       if b.provin<>1
	       		wcda4=1
	       else
	          if b.dpto>0 and b.dpto<8
	          	wcda1=1
	          else
	          	if b.dpto=13 or b.dpto=14 or b.dpto=15
	          		wcda1=1
	          	else
	          		if b.dpto>7 and b.dpto<13
	          			wcda2=1
	          		else
	          			if b.dpto=16 or b.dpto=17 or b.dpto=18
	          				wcda3=1
	          			endif	
	          		endif	
	          	endif		
	          endif			
           endif
		endif
		if condic = '3'
		   wfallec=1
	       if b.provin<>1
	       		wfaa4=1
	       else
	          if b.dpto>0 and b.dpto<8
	          	wfaa1=1
	          else
	          	if b.dpto=13 or b.dpto=14 or b.dpto=15
	          		wfaa1=1
	          	else
	          		if b.dpto>7 and b.dpto<13
	          			wfaa2=1
	          		else
	          			if b.dpto=16 or b.dpto=17 or b.dpto=18
	          				wfaa3=1
	          			endif	
	          		endif	
	          	endif		
	          endif			
           endif
		endif
		select 3
		use spestadd index spestai
		seek(wtitulo)
		if found()
		   replace inscri with inscri+winscri
		   replace habili with habili+whabili
		   replace carnde  with carnde+wcarne
		   replace fallec with fallec+wfallec
		   replace ina1  with ina1+wina1
		   replace ina2  with ina2+wina2
		   replace ina3  with ina3+wina3
		   replace ina4  with ina4+wina4
		   replace haa1  with haa1+whaa1
		   replace haa2  with haa2+whaa2
		   replace haa3  with haa3+whaa3
		   replace haa4  with haa4+whaa4
		   replace cda1  with cda1+wcda1
		   replace cda2  with cda2+wcda2
		   replace cda3  with cda3+wcda3
		   replace cda4  with cda4+wcda4
		   replace faa1  with faa1+wfaa1
		   replace faa2  with faa2+wfaa2
		   replace faa3  with faa3+wfaa3
		   replace faa4  with faa4+wfaa4
		endif
	endif
	endif	
endif
select 1
return            