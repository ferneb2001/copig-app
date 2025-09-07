procedure asgraba
*graba datos de r92 en spmatri
wop=1
wope=1
wpago={01/10/2024}
wvtohab={31/12/2025}
wr92act={01/10/2024}
wr92aut=2025
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
    	if r92aut<>2025
    	  if condic < '2'
    		if habili<>2025
    			replace habili with wr92aut
    			replace pago   with wpago
    			replace vtohab with wvtohab
    			replace r92fact with wr92act
    			replace r92aut  with wr92aut
    			replace r92vto  with wvtohab
    			select 2
    			append blank
    			replace matric  with a.numero
    			replace catego  with a.catego
    			replace fecha   with wpago
    			replace cpto    with '4'
    			replace importe with  122000
    			replace anhabil with wr92aut
    			replace detalle with 'Resol.92/04.'
    		endif
    	  endif	
    	endif
    endif	
    select 1
    skip
  enddo 		
close all
return

