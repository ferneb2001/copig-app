procedure spacm
*consulta de Empresas
set talk off
clear
@04,01 clear to 23,78
@04,28 say 'CONSULTA DE EMPRESAS'
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
wsigue='S'
@06,01 say 'MATRICULA       CATEGORIA    '
@06,30 say 'RAZ.SOCIAL: '
do while wsigue='S'
   wocat=1
   @22,10 get wocat pict '@*H \<Empresas Vigentes;\<Dadas de Baja' size 1,1
   read
   if wocat<1 or wocat>2
   		wsigue='N'
   endif		
   wop=1
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Matricula;\<C.U.I.T.';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(55)
         @06,30 say 'RAZ.SOCIAL: '
         @23,01 say 'Indique el nombre de la Empresa'
         @07,24 get wnom pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
         read
         if wocat=1
	         SELECT 1
    	     use spprofe index spprofen.idx
        	 define window pnom from 08,05 to 22,75
	         activate window pnom
    	     brow all for nombre =rtrim(wnom) in pnom
        	 deactivate window pnom 
	*         wkey=str(dctipo,1)+str(dcnro,8)
		     WKEY=str(dcnro,8)
        	 select 2
	         use spmatrie index spmatdoe.idx
    	     seek(wkey)
        	 if found()
	            do ver
    	     else
        	   @06,10 say 'Sin matr¡cula'   
	         endif
	      else
	         SELECT 1
    	     use svprofe index svprofen.idx
        	 define window pnom from 08,05 to 22,75
	         activate window pnom
    	     brow all for nombre =rtrim(wnom) in pnom
        	 deactivate window pnom 
	*         wkey=str(dctipo,1)+str(dcnro,8)
		     WKEY=str(dcnro,8)
        	 select 2
	         use svmatrie index svmatdoe.idx
    	     seek(wkey)
        	 if found()
	            do ver
    	     else
        	   @06,10 say 'Sin matr¡cula'   
	         endif
	      endif   
      else
         if wop= 3
            @06,01 say 'MATRICULA       CATEGORIA    '
            @23,01 say 'Indique el nro.de matricula y categoria o <ESC> para salir'  
            @06,11 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               @06,27 get wcatego pict '!!'
               read
               wkey2=str(wmatric,5)+wcatego
               if wocat=1
	               select 2
    	           use spmatrie index spmatrie.idx
        	       seek(wkey2)
            	   if found()
                	  wkey=str(dctipo,1)+str(dcnro,8)
	                  select 1
    	              use spprofe index spprofe
        	          seek(wkey)
            	      if found()
            	      	do ver
                	  else
	                     @06,38 say 'Sin datos personales'
    	              endif
	               else
    	              @06,10 say 'Sin matr¡cula'   
        	       endif
        	    else
	               select 2
    	           use svmatrie index svmatrie.idx
        	       seek(wkey2)
            	   if found()
                	  wkey=str(dctipo,1)+str(dcnro,8)
	                  select 1
    	              use svprofe index svprofe.idx
        	          seek(wkey)
            	      if found()
            	      select 2
            	      do ver
                	  else
	                     @06,38 say 'Sin datos personales'
    	              endif
	               else
    	              @06,10 say 'Sin matr¡cula'   
        	       endif
        	    endif   
            else
            endif
         else
            if wop= 4
               @07,01 say 'C.U.I.T.:'
               @23,01 say 'Indique CUIT o <ESC> para salir'
               @07,07 get wdctonr pict '99999999999'
               read
               if lastkey()<>27
                  wkey1=str(wdctonr,11)
                  if wocat=1
	                  select 1
    	              use spprofe index spprofec.idx
	    			   seek(wkey1)	
                	  if found()
                    	 wkey=str(dcnro,8)
	                     select 2
    	                 use spmatrie index spmatdoe.idx
        	             seek(wkey)
            	         if found()
            	            wkey3=str(dctipo,1)+str(dcnro,8)
                	        select 1
                    	    use spprofe index spprofe.idx
	                        seek(wkey3)
    	                    if found()
        	                   do ver	
                	        else
	                           @06,38 say 'Sin datos personales'
    	                    endif   
            	         else
	                        @06,10 say 'Sin matr¡cula'
        	             endif
            	       else
                	       @06,10 say 'No exite este cuit en archivo'
	                   endif 
	               else
	                  select 1
    	              use svprofe index svprofec.idx
    	              seek(wkey1)
                	  if found()
                    	 wkey=str(dcnro,8)
	                     select 2
    	                 use svmatrie index svmatdoe.idx
        	             seek(wkey)
            	         if found()
            	            wkey3=str(dctipo,1)+str(dcnro,8)
                	        select 1
                    	    use svprofe index svprofe.idx
	                        seek(wkey3)
    	                    if found()
        	                   do ver	
                	        else
	                           @06,38 say 'Sin datos personales'
    	                    endif   
            	         else
	                        @06,10 say 'Sin matr¡cula'
        	             endif
            	       else
                	       @06,10 say 'No exite este cuit en archivo'
	                   endif 
*	                   endif 
	               endif    
               else
               endif                 
            endif
         endif   
      endif          
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure ver
wkey2=str(b.numero,5)+b.catego
@06,11 say b.numero pict '99999'
@06,27 say b.catego
@07,24 say a.nombre
do pante01
@10,17 say b.inscr
@14,17 say b.pago
@16,17 say b.habili
@17,17 say b.condic
if b.condic=' ' or b.condic='1' or b.condic='A' 
	@17,30 say '                         '
else
	if b.condic='2' or b.condic='C'
		@17,30 say 'Comunic¢ Inactividad'
	else
		if b.condic='3' or b.condic='F'
			@17,30 say 'Baja por el Consejo '
		else
			if b.condic='4' or b.condic='R'
				@17,30 say 'Baja/Reinscripcion'
			else
				if b.condic='5' or b.condic='B'
					@17,30 say 'Baja solic. por Empresa'
				endif
			endif
		endif
	endif
endif
@23,01 say 'Oprima <ENTER> para ver datos personales'
read
do persone2 with wkey, wkey2
return