procedure spinfcee
*informe de Seccion Registro Profesional para Empresas
@03,01 clear to 23,78
@03,21 say ' CERTIFICADOS PARA EMPRESAS            '
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
dimension wsantipo(10), wsaninci(10), wsanreso(10), wsanfere(10), wsanvigd(10)
dimension wsanvigh(10), wsancnma(10), wsancpag(10), wsanfpag(10), wsanobs(10)
dimension wrstipo(10), wrstobs(10), wrstori(10), wrstfac(10), wrstpag(10), wrstimp(10), wrstotr(10)
store 0 to wsanreso(1), wsanreso(2), wsanreso(3), wsanreso(4), wsanreso(5)
store 0 to wsanreso(6), wsanreso(7), wsanreso(8), wsanreso(9), wsanreso(10)
store space(1) to wsaninci(1), wsaninci(2), wsaninci(3), wsaninci(4), wsaninci(5)
store space(1) to wsaninci(6), wsaninci(7), wsaninci(8), wsaninci(9), wsaninci(10)
store space(1) to wsantipo(1), wsantipo(2), wsantipo(3), wsantipo(4), wsantipo(5)
store space(1) to wsantipo(6), wsantipo(7), wsantipo(8), wsantipo(9), wsantipo(10)
store space(20) to wsanobs(1), wsanobs(2), wsanobs(3), wsanobs(4), wsanobs(5)
store space(20) to wsanobs(6), wsanobs(7), wsanobs(8), wsanobs(9), wsanobs(10)
store {  /  /  } to wsanfere(1), wsanfere(2), wsanfere(3), wsanfere(4), wsanfere(5)
store {  /  /  } to wsanfere(5), wsanfere(6), wsanfere(7), wsanfere(8), wsanfere(10)
store {  /  /  } to wsanvigd(1), wsanvigd(2), wsanvigd(3), wsanvigd(4), wsanvigd(5)
store {  /  /  } to wsanvigd(5), wsanvigd(6), wsanvigd(7), wsanvigd(8), wsanvigd(10)
store {  /  /  } to wsanvigh(1), wsanvigh(2), wsanvigh(3), wsanvigh(4), wsanvigh(5)
store {  /  /  } to wsanvigh(5), wsanvigh(6), wsanvigh(7), wsanvigh(8), wsanvigh(10)
store {  /  /  } to wsanfpag(1), wsanfpag(2), wsanfpag(3), wsanfpag(4), wsanfpag(5)
store {  /  /  } to wsanfpag(5), wsanfpag(6), wsanfpag(7), wsanfpag(8), wsanfpag(10)
store 0 to wsancnma(1), wsancnma(2), wsancnma(3), wsancnma(4), wsancnma(5)
store 0 to wsancnma(6), wsancnma(7), wsancnma(8), wsancnma(9), wsancnma(10)
store 0 to wsancpag(1), wsancpag(2), wsancpag(3), wsancpag(4), wsancpag(5)
store 0 to wsancpag(6), wsancpag(7), wsancpag(8), wsancpag(9), wsancpag(10)
store 0 to wrstimp(1),wrstimp(2), wrstimp(3), wrstimp(4), wrstimp(5), wrstimp(6)
store 0 to wrstimp(7), wrstimp(8), wrstimp(9), wrstimp(10)
store 0 to wrstotr(1),wrstotr(2), wrstotr(3), wrstotr(4), wrstotr(5), wrstotr(6)
store 0 to wrstotr(7), wrstotr(8), wrstotr(9), wrstotr(10)
store {  /  /  } to wrstori(1), wrstori(2), wrstori(3), wrstori(4), wrstori(5)
store {  /  /  } to wrstori(5), wrstori(6), wrstori(7), wrstori(8), wrstori(10)
store {  /  /  } to wrstfac(1), wrstfac(2), wrstfac(3), wrstfac(4), wrstfac(5)
store {  /  /  } to wrstfac(5), wrstfac(6), wrstfac(7), wrstfac(8), wrstfac(10)
store {  /  /  } to wrstpag(1), wrstpag(2), wrstpag(3), wrstpag(4), wrstpag(5)
store {  /  /  } to wrstpag(5), wrstpag(6), wrstpag(7), wrstpag(8), wrstpag(10)
store space(10) to wrstipo(1), wrstipo(2), wrstipo(3), wrstipo(4), wrstipo(5)
store space(10) to wrstipo(6), wrstipo(7), wrstipo(8), wrstipo(9), wrstipo(10)
store space(25) to wrstobs(1), wrstobs(2), wrstobs(3), wrstobs(4), wrstobs(5)
store space(25) to wrstobs(6), wrstobs(7), wrstobs(8), wrstobs(9), wrstobs(10)
wsigue='S'
wlin1='Secci¢n Registro Profesional INFORMA:'
WLIN2A='         Que la Empresa '
wlin3a='Matr¡cula: '
wlin3c=', figura inscripta  en  nuestros  Registros  Oficiales  desde  el'
wlin4b=', encontr ndose debidamente habilitada por el a¤o '
wlin5a='         Que no registra sanciones.-'
wlin6a='         Que el £ltimo domicilio registrado es:'
wlin7b=', NO encontr ndose debidamente habilitada por adeudar la  matr¡cula  co-'
wlin7ba=', NO encontr ndose debidamente habilitada para ejercer su               '
wlin7c='rrespondiente al a¤o '
wlin7d=', conforme al Decreto Ley'
wlin7e='3485/63 - Ley 5908.-'
wlin7f=', NO encontr ndose debidamente habilitada por adeudar las matr¡culas co-'
wlin7g='rrespondientes a los a¤os '
wlin7h=' a '
wlin7ha=' inclusive.-'
wlin7i='actividad por haber comunicado inactividad ante el Consejo Profesional.-'
wlin7j='actividad por haber sido dada de baja por el Consejo Profesional'     
wlin7k='actividad por estar suspendida.-'
wlin7l='profesi¢n por haber sido dada de baja la matr¡cula.-'
wlin8a='         Que registra la(s) siguiente(s) sancion(es):'
wlin8sa='Ley-Artic.  Inciso             Resol. Fecha   Confirm. Finaliza Matric.Cumplida    Observac.'
wlin8sb=space(80)
wlin8sc=space(80)
wlin8sd=space(80)
wlin8se=space(80)
wlin8sf=space(80)
wlin9a='         Que registra la(s) siguiente(s) restriccion(es): '
wlin10='         Que ha realizado el curso de post-grado en:'
wlin11='         Que no ha presentado constancia algun de haber realizado Curso de Es- '
wlin12='pecializaci¢n en Estructuras Antis¡smicas.'
wlin13='         Que registra los siguientes Representantes T‚cnicos:'
wlin14='     T¡tulo       Apellido y Nombre  Mat.Cat.   V¡nculo     desde  hasta '
WLINC01='EL SECRETARIO ADMINISTRATIVO DEL CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS'
WLINC02='CERTIFICA: Que la Empresa: '
wlinc03='Constitu¡da como '
wlinc04='Con actividad declarada de: '
wlinc05='Matr¡cula N§ '
wlinc06=' EMP, se encuentra debidamente habilitada para sus actividades'
wlinc07='dentro del territorio de la Provincia, por el a¤o 1998 conforme al Art. 8§ del'
wlinc08='Decreto Ley 3485/63, y su Reglamento 1041/65.---------------------------------'
wlinc09='Sus representantes T‚cnicos son: '
wlinc10='Quienes tienen su inscripci¢n actualizada a la fecha, encontr ndose debidamen-'
wlinc11='te habilitados para el ejercicio de sus profesi¢n y para representar t‚cnica-'
wlinc12='mente a la Empresa, la que se encuentra sujeta a los alcances de la habilita-'
wlinc13='ci¢n profesional de su o sus representantes t‚cnicos, consignados precedente-'
wlinc14='mente.-----------------------------------------------------------------------'
wlinc15='Se expide la presente certificaci¢n a solicitud de parte interesada, para ser'
wlinc16='presentada ante '
wlinc17='En la Ciudad de Mendoza, a los '
windsan=1
windres=1
*select 7
*use SPTINF index SPTINFI
*go top
do while wsigue='S'
   wop=1
   @04,01 clear to 23,78
   @04,01 say 'MATRICULA       CATEGORIA    '
   @04,30 say 'NOMBRE: '
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Matricula';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(55)
         @04,30 say 'NOMBRE: '
         @23,01 say 'Indique el nombre de la empresa  '
         @05,20 get wnom pict '@!'
         read
        if lastkey()<>27
         SELECT 1
         use spprofe index spprofen
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow all for nombre =rtrim(wnom) in pnom
         deactivate window pnom 
         wkey=str(dctipo,1)+str(dcnro,8)
         WNOMBRE=NOMBRE
         select 2
         use spmatrie index spmatdoe
         locate for wkey=str(dctipo,1)+str(dcnro,8)
         do while found()
*         seek(wkey)
*         if found()
            wkey2=str(numero,5)+catego
            wmatric=numero
            wcatego=catego
*            IF b.condic<>'3'
			 wcondic=a.estado
			 whabili=b.habili
             if b.fechab<>{  /  /  }
			    winscr=b.fechab
			 else   
			    if b.inscr<>{  /  /  }
			       winscr=b.inscr
			    else
			 	   winscr={  /  /  }
			 	endif
			 endif	          
             do ver
*            endif   
            select 2
            continue
         enddo   
*         else
*           @04,10 say 'Sin matr¡cula'   
         endif
      else
         if wop= 3
            @04,01 say 'MATRICULA       CATEGORIA    '
            @23,01 say 'Indique el nro.de matricula y categoria o <ESC> para salir'  
            @04,11 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               @04,27 get wcatego pict '!!'
               read
               wkey2=str(wmatric,5)+wcatego
               select 2
               use spmatrie index spmatrie
               seek(wkey2)
               if found()
                  wkey=str(dctipo,1)+str(dcnro,8)
                  select 1
                  use spprofe index spprofe
                  seek(wkey)
                  if found()
                     wnombre=nombre
                     select 2
*                     if b.condic<>'3'
					 wcondic=a.estado
					 whabili=b.habili
        	         if b.fechab<>{  /  /  }
			 	        winscr=b.fechab
			         else
        			    if b.inscr<>{  /  /  }
		        	       winscr=b.inscr
			            else
			 	           winscr={  /  /  }
			        	endif
			         endif	          
                     do ver
*                    endif   
                 else
                     @04,38 say 'Sin datos personales'
                 endif
               else
                  @04,10 say 'Sin matr¡cula'   
               endif
*            else
            endif
         endif   
      endif          
   endif
enddo
@04,01 clear to 23,78
close all
return
****************************procedimiento ver ******* 
procedure ver
windsan=1
windres=1
store '99999' to wsanreso(windsan)
store '99999' to wrstipo(windres)
wkey2=str(wmatric,5)+wcatego
@04,11 say wmatric pict '99999'
@04,27 say wcatego
@04,38 say wnombre
do panta11
WNOTORGA=SPACE(30)
select 2   
@05,17 say b.habili
if a.estado = 'A'
	@06,17 say "Activa "
else
   if a.estado = 'C'
     @06,17 say "Comunico Inactividad"
   else
     if a.estado = 'F'
     	@06,17 say "Baja por Consejo"
     else
        if a.estado = 'S'
           @06,17 say "Suspendida"
        else
           if b.condic = '05'
              @06,17 say "Baja de Matricula"
           else
              @06,17 say "Inhabilitada otros motivos"
           endif
        endif
     endif
  endif
endif
wmatri=wmatric
wcateg=wcatego
save screen to panta11
select 4
use spsance index spsance
wsigsan='S'
wisanc=0
do while wsigsan='S'
   wlin=14
   @12,01 clear to 19,78
   do ponetit
   locate for wkey2=str(matric,5)+catego
   do while found()
      @wlin,2 say santipo
      @wlin,4 say saninci
      @wlin,6 say sanresol
      @wlin,12 say sanferes
      @wlin,21 say sanvigde
      @wlin,30 say sanvigha
      @wlin,38 say sancnmat pict '999'
      @wlin,42 say sancpag
      @wlin,44 say sanfpag
      @wlin,59 say sanobs
      wop=1
      @23,01 clear to 23,78
      @23,22 get wop pict '@*H \<informar y continuar;\<continuar;\<salir' size 1,1
      read
      if wop = 3
         wsigsan='N'
         exit
      else   
         if wop = 1
            wisanc=1
            do ingrsan
         endif
         wlin=wlin+1
         if wlin > 19
            do limpia
            wlin=14
         endif
         @23,01 clear to 23,78
         continue
      endif   
   enddo
   wsigsan='N'
enddo
w2opc=0
@23,01 get w2opc pict 'Enter para continuar' size 1,1
read
 
*        rutina de busqueda de restricciones              
select 9
use sprestri index sprestri
wsigres='S'
wirest=0
do while wsigres='S'
   wlin=14
   @12,01 clear to 19,78
*   do ponetire
   locate for wkey2=str(matric,5)+catego
   do while found()
      if restrotr = 0
         @wlin,1 say restrtipo
         @wlin,13 say observac
         @wlin,39 say restforig
         @wlin,48 say restfactu
         @wlin,57 say restfpago
         @wlin,66 say restimpo pict '99999,99'
         @wlin,75 say restrotr
         wop=1
         @23,01 clear to 23,78
         @23,22 get wop pict '@*H \<informar y continuar;\<continuar;\<salir' size 1,1
         read
         if wop = 3
            wsigres='N'
            exit
         else   
            if wop = 1
               wirest=1
               do ingrest
            endif
            wlin=wlin+1
            if wlin > 19
               do limpia
               wlin=14
            endif
            @23,01 clear to 23,78
  *          continue
         endif
      endif
      continue     
   enddo
   wsigres='N'
enddo
restore screen from panta11
select 4
use splocal index splocal
locate for d.cod=a.locali
if found()
   wwnloc=d.nombre
   wlocal=d.cod
else
   wwnloc=space(15)
   wlocal=0
endif      
select 5
use spdpto order dpto
locate for e.dpto=a.dpto
if found()
   wwndpto=e.nombre
   wdpto=e.dpto
else   
   wwndpto=space(15)
   wdpto=0
endif   
select 5
use spprov order prov
locate for e.prov=a.provin
if found()
   wwnprov=rtrim(e.nombre)
   wprov=e.prov
else   
   wwnprov=space(10)
   wprov=0
endif
wdomtip=0
if a.tipo=1
   wdomtip=1
endif   
@08,18 say a.domici
@09,18 say wwnloc
@09,41 say wwndpto
@09,63 say wwnprov
@08,60 say a.telef
if wdomtip=1
   @09,01 say 'Domicilio no actualizado'
endif
wsiga='S'
@10,01 clear to 23,78
wind=1
@10,01 say wlin1
@11,01 say wlin2a
*@13,16 say wtitdesc
@11,48 say wnombre
@12,01 say wlin3a
@12,12 say wmatric pict '99999'
*@14,18 say wlin3b
@12,25 say wcatego
@12,29 say wlin3c
*@15,01 say wlin4a
@13,04 say winscr
if wcondic < '2' 
   if whabili > 1997 
      @13,13 say wlin4b
   else
      if whabili = 1997
         @13,13 say wlin7b
         @14,01 say wlin7c
         @14,48 say '1998 '
      else
   	     @14,01 say wlin7f
   	     @15,01 say wlin7g
   	     wmatdes=whabili+1
   	     @15,26 say wmatdes pict '9999'
   	     @15,30 say ' a '
   	     @15,33 say '1998 '
   	     @15,65 say wlin7ha
      endif
   endif
else
   if wcondic = 'C'
      @13,13 say wlin7ba
      @14,01 say wlin7i
   else
      if wcondic = 'F'
         @13,13 say wlin7ba
         @14,01 say wlin7j
      else
         if wcondic = 'S'
            @13,13 say wlin7ba
            @14,01 say wlin7k
         else
            if wcondic = '5'
               @13,13 say wlin7ba
               @14,01 say wlin7l
            endif   
         endif   
      endif   
   endif
endif
@16,01 say wlin6a
@17,01 say a.domici
@17,46 say wwnloc
@17,60 say wwndpto
@18,46 say wwnprov
@18,60 say a.telef
if wdomtip = 1
   @19,15 say 'Domicilio NO actualizado ' color n/w*
endif
if wisanc = 0
   @07,17 say ' No existen sanciones '
else
   @07,17 say '    existen sanciones '
endif
if wirest = 0
	@7,40  say 'No existen restricciones'
else
	@7,40  say '   EXISTEN Restricciones'	      
endif	
*wlin=10
*     mostrar por pantalla lo encontrado para confirmar
*     imprimir o salir.
@20,01 clear to 23,78
if whabili>1997
   if wisanc = 0
   if wirest = 0
      if wcondic = 'A' or wcondic < '2'
         wop3=1
         @23,01 get wop3 pict '@*H \<Salir;\<Imprimir' size 1,1
         read
         if wop3 = 2
            wconst=space(60)
            wactiv1=space(49)
            wactiv2=space(60)
            @20, 01 say 'Constitu¡da: '
            @21, 01 SAY 'Actividad  : '
            @20,15 get wconst
            @21,15 get wactiv1
            @22,01 get wactiv2
            read
            @20,01 clear to 23,78
            wpresen=space(62)
            wfech11=space(46)
            wfech12=space(40)
            @20,01 say 'Presentar ante: '
            @21,01 say 'Fecha (letras): '
            @20,15 get wpresen
            @21,15 get wfech11
            @22,15 get wfech12
            read
            wopim=1
            @23,20 clear to 23,78
            @23,21 get wopim pict '@*H \<H.P.;\<Epson' size 1,1
            read
            wcopia=1
            @22,45 say 'Cantidad de Copias:'
            @22,68 get wcopia pict '9'
            read
            if wcopia=0
            	wcopia=1
            endif
            do while wcopia > 0
	            set printer to lpt1
    	        set console off
        	    set printer on
	            set device to printer
	            if wopim=2
	    	        ? chr(27)+chr(77)
    	    	    ?
	    	        ?
    	    	    ?
	        	    ?
		            ?
    		        ?
        		    ?
	            	?
	    	        ?? wlinc01
    	    	    ?wlinc02
        	    	?? wnombre
	        	    ?wlinc03
    	        	?? wconst
    	    	    ? wlinc04
	    	        ?? wactiv1
    	    	    if wactiv2<>space(79)
        	    	   ?wactiv2
		            endif
    		        ? wlinc05
        		    ?? wmatric pict '99999' 
	        	    ?? wlinc06 
    	        	?wlinc07
	        	    ?wlinc08
		            ?wlinc09
    		        ?? chr(18)
        		    ?? chr(27)+chr(77)
		            do buscarep
    		        ?
        		    ?wlinc10
	        	    ?wlinc11
	    	        ?wlinc12
    	    	    ?wlinc13
	    	        ?wlinc14
    	    	    ?
	        	    ?wlinc15
		            ?wlinc16
    		        ??wpresen
        		    ?wlinc17
		            ??wfech11
    		        ?wfech12  
        		    ??chr(27)+chr(80)	
	        	    eject
	        	 else
	    	        ?? chr(027)+chr(069)
	    	        ?? chr(027)+chr(040)+chr(115)+'12'+chr(072)
    	    	    ?
	    	        ?
    	    	    ?
	        	    ?
		            ?
    		        ?
        		    ?
	            	?
	            	? chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
	    	        ?? wlinc01
	            	?? chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
    	    	    ?wlinc02
	            	?? chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
	    	        ?? wnombre
	            	?? chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
	        	    ?wlinc03
    	        	?? wconst
    	    	    ? wlinc04
	    	        ?? wactiv1
    	    	    if wactiv2<>space(79)
        	    	   ?wactiv2
		            endif
    		        ? wlinc05
        		    ?? wmatric pict '99999' 
	        	    ?? wlinc06 
    	        	?wlinc07
	        	    ?wlinc08
		            ?wlinc09
    		        ?? chr(18)
        		    ?? chr(27)+chr(77)
		            do buscarep
    		        ?
        		    ?wlinc10
	        	    ?wlinc11
	    	        ?wlinc12
    	    	    ?wlinc13
	    	        ?wlinc14
    	    	    ?
	        	    ?wlinc15
		            ?wlinc16
    		        ??wpresen
        		    ?wlinc17
		            ??wfech11
    		        ?wfech12  
        		    ??chr(27)+chr(80)	
	        	    eject
	        	     
    	     endif   
      endif  
   endif
endif
endif   
set printer off
set device to screen            	     
return


procedure panta11
@05,01 clear to 23,78
@05,02 say "Habilitado  :"
@06,02 say "Estado      :"
@07,02 say "Sancion     :"
@08,02 say "Domicilio   :"
return

*procedure graba
*select 7
* append blank
*return



procedure buscarst
parameter  wmatric, wcateg
select 9
use sprestri index sprestri
@23,01 clear to 23,78
@23,01 say 'Oprima <ESC> para salir'
define window prest from 10,05 to 22,75 title 'Restricciones'
activate window prest
browse fields restrtipo:H='Tipo',observac:H='Observ.',restforig:H='F.Orig.',restimpo:H='Importe',;
			  restfactu:H='F.Vto.',restfpago:H='F.Pago';
		for matric=wmatric and catego=wcateg and restrotr = 0 in prest
deactivate window prest
@23,01 clear to 23,78
return		

procedure ingrsan

*select 9
*use sptsanin index sptasin
*append blank
wsantipo(windsan)=santipo
wsaninci(windsan)=saninci
wsanfere(windsan)=sanferes
wsanreso(windsan)=sanresol
wsanvigd(windsan)=sanvigde
wsanvigh(windsan)=sanvigha
wsancnma(windsan)=sancnmat
wsancpag(windsan)=sancpag
wsanfpag(windsan)=sanfpag
wsanobs(windsan)=sanobs
wisanc=1
windsan=windsan+1
wsanreso(windsan)=99999
return

procedure ingrest
*select 9
*use sptresin index sptresin
*append blank
wrstipo(windres)=restrtipo
wrstobs(windres)=observac
wrstori(windres)=restforig
wrstfac(windres)=restfactu
wrstpag(windres)=restfpago
wrstimp(windres)=restimpo
wrstotr(windres)=restrotr
wirest=1
windres=windres+1
wrstipo(windres)='99999'
return

procedure ponetit
@13,01 clear to 20,78
@13,01 say 'T.In.Resol. Fecha   D.  Vigencia  H'
@13,37 say 'Mat.Cgo.F.Pago  Recibo  Observac.'
@19,01 say '1- Sanc.Ley 3485 Art.34        5- Art.46 Ley 5908'
@20,01 say '2- Sanc.Faltas Cod. Etica      6- Otros'
@21,01 say '3- Sanc. Art.32 Ley 3485'
@22,01 say '4- Sanc. Art.33 Ley 3485'
return

procedure limpia
@13,01 clear to 21,78
return

procedure buscarep
wrtsigue='S'
wrtfecha={  /  /  }
wrtfechf={  /  /  }
wrtcpto=space(1)
wrtmat=0
wrtcat=space(2)
wrtnom=space(30)
wrttit=space(30)
wkeyrt=space(7)
wkeyrt1=space(9)
wsetit=0
select 7
use sprtcos order empresa
go top
locate for str(empresa,5)=str(wmatric,5)
do while found()
   if wsetit=0
*      ?wlin13
      ?wlin14
      ?
      wsetit=1
   endif
   ??chr(15)   
   wrtnomb=space(30)
   wrttit=space(30)
   wkeyrt=str(matprof,5)+categor
   wrtvinc=rtvinculo
   wrtmat=matprof
   wrtcat=categor
   wrtfecha=rtinicio
   wrtfechf=rtfinal
   select 8
   use spmatri index spmatri
   seek(wkeyrt)
   wsert=0
   if found()
      if wrtfechf = {  /  /  } or wrtfech > date()
       wphabil=habili
       wpestad=condic
        if wphabil > 1991
         if wpestad < '2'
            select 3 
            use sptitu order titulo
            select 8
            set relation to titulo into sptitu
            wrttit=c.titdesc
            wkeyrt1=str(dctipo,1)+str(dcnro,8)
            select 6
            use spprof index spprof
            seek(wkeyrt1)
            if found()
                wrtnomb=nombre
                wsert=1
            endif
            if wsert= 1
               ? wrttit
               ??' '
               ?? wrtnomb
               ??'   '
               ?? wrtmat pict '9999'
               ??' '
               ??wrtcat
               ??'         '
               if wrtvinc = 1
                ?? 'Contrato '
               else
                if wrtvinc = 2
                   ?? 'Socio   '
                else
                   if wrtvinc = 3
                      ?? 'Rel.Depend.'
                   else
                      if wrtvinc = 4
                         ?? 'Gerente '
                      else
                         if wrtvinc = 5
                            ?? 'Apoderado'
                         else
                            if wrtvinc = 6
                               ?? 'Por Obra '
                            else
                               if wrtvinc = 7
                                  ?? 'Contr.Ren.Aut.'
                               else
                                  if wrtvinc = 8
                                     ?? 'Propietario'
                                  else
                                     if wrtvinc = 9
                                        ?? "Contrato Renov.Aut."
                                     else
                                        if wrtvinc = 10
                                           ?? "Desconocido"
                                        else
                                           if wrtvinc = 11
                                              ?? 'Contr.sin Vto.'
                                           endif   
                                        endif      
                                     endif
                                  endif
                               endif
                            endif
                         endif
                      endif
                   endif
                endif
             endif
             ?? wrtfecha at 101
             ?? wrtfechf at 112
             ?
          endif
       endif
    endif      
  endif
  endif
   ??chr(18)   
   select 7
   continue
enddo
return      
       