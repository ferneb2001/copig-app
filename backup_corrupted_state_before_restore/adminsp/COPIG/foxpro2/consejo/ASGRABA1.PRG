procedure asgraba1
*graba datos de r92 en spmatri
wop=1
wope=1
wpago={31/12/2021}
wvtohab={31/12/2022}
wr92act={31/12/2021}
wr92aut=2022
@04,01 clear to 23,78
@04,15 say 'GRABA SENAL DE r92 en spmatri y sppagos '
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive off
   select 1
   use z:\adminsp\spmatri index z:\adminsp\spmatri.idx
   select 2  
   use z:\adminsp\sppagos index z:\adminsp\sppagos.idx
   select 1
   go top
   do while not eof()
    if r92aut<>0
    	if r92aut=2022
    		if  r92vto <>{31/12/2022}
    			replace r92vto with wvtohab
    		endif
    	endif
    endif	
    select 1
    skip
  enddo 		
close all
return

