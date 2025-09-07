procedure spalg19
*listado de profesionales
* Inscriptos o matriculados por mes o entre fechas
SET TALK OFF
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
use sptempo
zap
set exclusive off
set date dmy
set century on
wfecha={  /  /    }
wdesde={  /  /    }
whasta=date()
whabi=' '
wop=1
wcuil=0
wcuen=0
wprovis=0
wnomtit=space(30)
@08,02 say 'Par metros'
@10,02 say 'Ingresados desde: '
@12,02 say '           hasta: '
@13,02 say 'Fecha reuni¢n: '
@10,20 get wdesde
@12,20 get whasta
@13,20 get wfecha
read

@14,02 say 'Provisorios = 0 : '
@16,02 say 'Matriculados= 1 : '
@16,20 get wprovis pict '9'
read
@23,01 clear to 23,78
   wop=1
   wop3=0
   wcatego='A '
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   wop=1
   wdpto=0
   wnomdpto=space(15)
   @20,01 say 'Se listar n todos los profesionales '
   if wcatego<>'  '
      @20,37 say wcatego
      @20,39 say ', '
   endif   
   if wtitulo<>'   '
      @20,40 say rtrim(wnomtit)
   endif
   if whabi='S'
      @21,01 say '   habilitados'
   else
      if whabi='N'
         @21,01 say 'no habilitados'
      endif
   endif
   if wdpto>0
      @21,16 say 'del departamento '
      @21,33 say wnomdpto
   endif
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      select 1
      use spmatri
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
       if catego='A '
         sisi=1
         if inscr<>{  /  /    }
	         if inscr >= wdesde .and. inscr <= whasta
    	        sisi=0
    	     endif   
       	 else
            if fechab >= wdesde .and. fechab <= whasta
               sisi=0
            endif
         endif
         if sisi=0
         	if wprovis=0
         		if fectit={  /  /    }
         			sisi=0
         		else
         			if feccert<>{  /  /    }
         			   if feccert>=wdesde and feccert<= whasta
         			    	sisi=0
         			   else
         			   		sisi=1
         			   endif 	
         			else	
         		    	sisi=1
         		    endif
         		    	
         		endif		
         	else
         		if fectit<>{  /  /    }
         			sisi=0
         		else
         			sisi=1
         		endif	
         	endif
         endif	
         if sisi=0          
   		       if wcatego='  ' or catego=wcatego
                    do arma
                else
                  endif
*               endif
            endif
         endif
*       endif        
      select 1
      skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
*      if wdpto=0 .and. wtitulo='   ' 
         sort to sptempos on numero, catego
         do imprime
*      endif
  endif   
*endif
@04,01 clear to 23,78
close all
return

procedure imprime
set date dmy
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use sptempos
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
   wlin=70
   whoja=0
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=space(5)
   do while .not. eof()
      select 1         
      ?numero pict '99999' at 1
      ??catego at 7 
      ??nombre  at 9
      ??substr(titnomb,1,40) at 40
	  ?substr(titotorga,1,40) at 40
	  ?'     ----------------------------------------------------------'
      wlin=wlin+3
      wcuen=wcuen+1
      if wlin > 67
*        eject
         do titulos
*         do titulosb
      endif
   skip
   enddo
   ?
   ?
   ? '     Total de profesionales listados: '
   ?? wcuen
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if whoja <> 0
   if wlin > 66
      eject
   endif
endif      
whoja=whoja+1
? '     CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'REUNION ORDINARIA DEL CONSEJO' AT 20
?'                                          Mendoza:'
?? wfecha
IF wprovis=0
?'           INSCRICPIONES PROVISORIAS' AT 05
else
?'           MATRICULACIONES          ' AT 05
endif
?'                  Fechas desde el '
?? wdesde
?? ' y el '
??whasta   
??'Hoja Nro.' at 65
??whoja pict '999'
?
? ' MATR.CAT.  APELLIDO Y NOMBRE' 
?? ' T¡tulo/Entidad Otorgante T¡tulo' AT 39
wlin = 8
return


procedure titulosb
?
?wnomtit AT 25
?
wlin=wlin+3
return

procedure arma
@21,30 say pago
*@21,60 get wop
wop=0
wtitulo=titulo
select 5
use sptitu order titulo
seek(wtitulo)
  if found()
     wnomtit=titdesc
  else
     wnomtit=space(30)
  endif
select 1            
wnoment=space(30)
if wop=0        
 select 2
 seek(str(a.dctipo,1)+str(a.dcnro,8))
 if found()
 *   if a.titulo = '001' or a.titulo = '002' or a.titulo = '003' or a.titulo = '042' or a.titulo = '801'
      @18,1 say a.numero
      @18,7 say a.catego
      @18,10 say b.nombre
      @18,60 say b.nacio
 *     if dpto = 11 or dpto = 12 
 *           if b.nacio > {31/10/49}
 *           @19,60 say b.nacio
         select 7
         use spente order codigo
         seek(a.otorga)
         if found()
         	wnoment=nombre
         else
         	wnoment=space(30)
         endif		
         select 3
         append blank
         replace numero with a.numero
         replace catego with a.catego
         replace titulo with a.titulo
         replace habili with a.habili
         replace condic with a.condic
         replace dctipo with b.dctipo
         replace dcnro  with b.dcnro
         replace nombre with b.nombre
         replace domici with b.domici
         replace provin with b.provin
         replace dpto   with b.dpto
         replace locali with b.locali
         replace telef  with ltrim(b.telef)
         replace titotorga with substr(wnoment,1,40)
         replace titnomb with substr(wnomtit,1,40)
         replace cuil with b.cuit
         if a.inscr<>{  /  /  }
            replace fecha  with a.inscr
         else
            if a.fechab<>{  /  /  }
               replace fecha with a.fechab
            else   
               replace fecha with a.feccert
            endif   
         endif   
     endif 
endif
*endif
return