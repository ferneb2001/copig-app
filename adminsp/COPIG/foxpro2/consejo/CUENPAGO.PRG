procedure cuenpago
* cuenta registros de pagos por ano de habilitacion y fecha de pago
@03,10 say 'CUENTA REGISTROS DE PAGOS POR A¤O'
WMA90=0
WMA91=0
WMA92=0
WMA93=0
WMA94=0
WMA95=0
WMA96=0
WMA97=0
WANTE=0
wposter=0
SET TALK OFF
SET DATE TO YMD
USE SPPAGOS
DO WHILE NOT EOF()
   @20, 01 say anhabil
   @20, 10 say fecha
   @20, 20 say matric
   @20, 60 say recno()
*   IF ANHABIl < 1990
*      WANTE=WANTE+1
*   ELSE
*      IF ANHABIl = 1990 AND FECHA <= {90/12/31}
*         wma90=wma90+1
*      ELSE
*         if anhabil=1991 and fecha <= {91/12/31}
*            wma91=wma91+1
*         else
            if anhabil=1992 
               wma92=wma92+1
*            else
*               if anhabil = 1993 and fecha <={93/12/31}
*                  wma93=wma93+1
*               else
*                  if anhabil=1994 and fecha <={94/12/31}
*                     wma94=wma94+1
*                  else
*                     if anhabil=1995 and fecha <={95/12/31}
*                        wma95=wma95+1
*                     else
*                        if anhabil > 1989 and anhabil < 1996
*                           if fecha >= {96/01/01}
*                           	   wposter=wposter+1
*                           	   if anhabil=1990
*                           	      wma90=wma90+1
*                           	   else
*                           	      if anhabil=1991
*                           	         wma91=wma91+1
*                           	      else
*                           	         if anhabil=1992
*                           	            wma92=wma92+1
*                           	         else
*                           	            if anhabil=1993
*                           	               wma93=wma93+1
*                           	            else
*                           	               if anhabil=1994
*                           	                  wma94=wma94+1
*                           	               else
*                           	                  if anhabil=1995
*                           	                     wma95=wma95+1
*                           	                  endif   
*                           	               endif   
*                           	            endif
*                           	         endif   
*                           	      endif
*                           	   endif         
*                           endif
*                        endif   	   
*                     endif
*                  endif
*               endif
*            endif   
*         endif   
*      ENDIF
   ENDIF
   skip 1
ENDDO
@05,01 say 'Totales acumulados'
*@06,01 say wante
*@06,15 say wma90
*@06,30 say wma91
@06,45 say wma92
*@06,60 say wma93
*@07,15 say wma94
*@07,30 say wma95
*@07,45 say wposter
wop=0
@23,01 say 'digite un tecla para terminar'
@23,50 get wop
read
close all
clear all
